using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MzansiWork.Api.Data;
using MzansiWork.Api.Security;
using Serilog;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((context, _, configuration) =>
{
    var directory = Path.GetFullPath(Path.Combine(context.HostingEnvironment.ContentRootPath, "..", "..", "logs"));
    Directory.CreateDirectory(directory);
    configuration
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(Path.Combine(directory, "api-.log"), rollingInterval: RollingInterval.Day, shared: true);
});
builder.Configuration.AddUserSecrets(Assembly.GetExecutingAssembly(), optional: true);
var provider = builder.Configuration["Database:Provider"] ?? "Postgres";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite"));
        return;
    }

    var connection = new Npgsql.NpgsqlConnectionStringBuilder(builder.Configuration.GetConnectionString("Postgres"));
    var password = builder.Configuration["Supabase:DbPassword"];
    if (!string.IsNullOrWhiteSpace(password)) connection.Password = password;
    if (string.IsNullOrWhiteSpace(connection.Password))
        throw new InvalidOperationException("Set Supabase:DbPassword with dotnet user-secrets. The database password is not stored in the repository.");
    options.UseNpgsql(connection.ConnectionString);
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is required.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MzansiWork",
        Version = "v1",
        Description = "Create an organisation with POST /api/auth/register, or sign in with POST /api/auth/login. Then use Authorize and paste the token. Sample company, if you need it: lerato@mzansiwork.co.za / Password123."
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Paste the token from POST /api/auth/login.",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});
builder.Services.AddScoped<TokenService>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:5173", "http://localhost:8081", "http://localhost:19006")));

var app = builder.Build();
if (args.Contains("--check-db"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var details = new Npgsql.NpgsqlConnectionStringBuilder(db.Database.GetConnectionString());
    Console.WriteLine($"Host: {details.Host}");
    Console.WriteLine($"Database: {details.Database}");
    Console.WriteLine($"User: {details.Username}");
    if (!db.Database.CanConnect())
    {
        Console.Error.WriteLine("Could not connect.");
        Environment.Exit(1);
    }

    Console.WriteLine("Connected.");
    var connection = db.Database.GetDbConnection();
    connection.Open();
    using var command = connection.CreateCommand();
    command.CommandText = "select tablename from pg_tables where schemaname = 'mzansi' order by tablename";
    using var reader = command.ExecuteReader();
    var tables = new List<string>();
    while (reader.Read()) tables.Add(reader.GetString(0));
    Console.WriteLine($"Schema mzansi: {tables.Count} tables");
    foreach (var table in tables) Console.WriteLine($"  {table}");
    return;
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    var createWorkOptionsTable = provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase)
        ? """
          CREATE TABLE IF NOT EXISTS "EmployeeWorkOptions" (
              "OrganisationId" TEXT NOT NULL,
              "UserId" TEXT NOT NULL,
              "ProjectsJson" TEXT NOT NULL,
              "TasksJson" TEXT NOT NULL,
              "CategoriesJson" TEXT NOT NULL,
              PRIMARY KEY ("OrganisationId", "UserId")
          );
          """
        : """
          CREATE TABLE IF NOT EXISTS mzansi."EmployeeWorkOptions" (
              "OrganisationId" uuid NOT NULL,
              "UserId" uuid NOT NULL,
              "ProjectsJson" text NOT NULL,
              "TasksJson" text NOT NULL,
              "CategoriesJson" text NOT NULL,
              PRIMARY KEY ("OrganisationId", "UserId")
          );
          """;
    db.Database.ExecuteSqlRaw(createWorkOptionsTable);
    var leavePolicySql = provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase)
        ? new[]
        {
            """
            CREATE TABLE IF NOT EXISTS "LeavePolicies" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_LeavePolicies" PRIMARY KEY,
                "OrganisationId" TEXT NOT NULL,
                "Code" TEXT NOT NULL,
                "Name" TEXT NOT NULL,
                "Enabled" INTEGER NOT NULL,
                "TracksDays" INTEGER NOT NULL,
                "GrantMode" TEXT NOT NULL,
                "AllowanceDays" TEXT NULL,
                "MonthlyDays" TEXT NULL,
                "Cycle" TEXT NOT NULL,
                "CycleStart" TEXT NOT NULL,
                "AppliesTo" TEXT NOT NULL,
                "EmployeeNote" TEXT NOT NULL,
                "SortOrder" INTEGER NOT NULL
            );
            """,
            """CREATE UNIQUE INDEX IF NOT EXISTS "IX_LeavePolicies_OrganisationId_Code" ON "LeavePolicies" ("OrganisationId", "Code");""",
            """
            CREATE TABLE IF NOT EXISTS "LeaveOpenings" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_LeaveOpenings" PRIMARY KEY,
                "OrganisationId" TEXT NOT NULL,
                "UserId" TEXT NOT NULL,
                "PolicyId" TEXT NOT NULL,
                "OpeningDays" TEXT NOT NULL,
                "AsOf" TEXT NOT NULL
            );
            """,
            """CREATE UNIQUE INDEX IF NOT EXISTS "IX_LeaveOpenings_OrganisationId_UserId_PolicyId" ON "LeaveOpenings" ("OrganisationId", "UserId", "PolicyId");"""
        }
        : new[]
        {
            """
            CREATE TABLE IF NOT EXISTS mzansi."LeavePolicies" (
                "Id" uuid NOT NULL,
                "OrganisationId" uuid NOT NULL,
                "Code" text NOT NULL,
                "Name" text NOT NULL,
                "Enabled" boolean NOT NULL,
                "TracksDays" boolean NOT NULL,
                "GrantMode" text NOT NULL,
                "AllowanceDays" numeric(6,2) NULL,
                "MonthlyDays" numeric(6,2) NULL,
                "Cycle" text NOT NULL,
                "CycleStart" date NOT NULL,
                "AppliesTo" text NOT NULL,
                "EmployeeNote" text NOT NULL,
                "SortOrder" integer NOT NULL,
                CONSTRAINT "PK_LeavePolicies" PRIMARY KEY ("Id")
            );
            """,
            """CREATE UNIQUE INDEX IF NOT EXISTS "IX_LeavePolicies_OrganisationId_Code" ON mzansi."LeavePolicies" ("OrganisationId", "Code");""",
            """CREATE INDEX IF NOT EXISTS "IX_LeavePolicies_OrganisationId" ON mzansi."LeavePolicies" ("OrganisationId");""",
            """ALTER TABLE mzansi."LeavePolicies" ENABLE ROW LEVEL SECURITY;""",
            """
            CREATE TABLE IF NOT EXISTS mzansi."LeaveOpenings" (
                "Id" uuid NOT NULL,
                "OrganisationId" uuid NOT NULL,
                "UserId" uuid NOT NULL,
                "PolicyId" uuid NOT NULL,
                "OpeningDays" numeric(6,2) NOT NULL,
                "AsOf" date NOT NULL,
                CONSTRAINT "PK_LeaveOpenings" PRIMARY KEY ("Id")
            );
            """,
            """CREATE UNIQUE INDEX IF NOT EXISTS "IX_LeaveOpenings_OrganisationId_UserId_PolicyId" ON mzansi."LeaveOpenings" ("OrganisationId", "UserId", "PolicyId");""",
            """ALTER TABLE mzansi."LeaveOpenings" ENABLE ROW LEVEL SECURITY;"""
        };
    foreach (var statement in leavePolicySql) db.Database.ExecuteSqlRaw(statement);
    DbSeeder.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => options.DocumentTitle = "MzansiWork API");
}

app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var error = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    Log.Error(error, "Unhandled {Method} {Path}", context.Request.Method, context.Request.Path);
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new { message = "Something went wrong. The details are in the logs folder." });
}));
app.UseSerilogRequestLogging();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", database = provider, product = "MzansiWork" }));
app.MapPost("/api/log", (ClientLog entry) =>
{
    var message = (entry.Message ?? "").ReplaceLineEndings(" ");
    if (message.Length > 500) message = message[..500];
    Log.Warning("Client {Scope}: {Message}", entry.Scope ?? "app", message);
    return Results.NoContent();
});
app.MapControllers();
Log.Information("MzansiWork API starting. Database provider {Provider}. Logs are in the logs folder.", provider);
app.Run();

record ClientLog(string? Scope, string? Message);
