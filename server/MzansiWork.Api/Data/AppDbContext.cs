using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Domain;

namespace MzansiWork.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Organisation> Organisations => Set<Organisation>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<SubscriptionRecord> Subscriptions => Set<SubscriptionRecord>();
    public DbSet<CorrectionRequest> Corrections => Set<CorrectionRequest>();
    public DbSet<LeaveRequestRecord> LeaveRequests => Set<LeaveRequestRecord>();
    public DbSet<AgentEvent> AgentEvents => Set<AgentEvent>();
    public DbSet<AuditRecord> Audit => Set<AuditRecord>();
    public DbSet<EmailMessage> Emails => Set<EmailMessage>();
    public DbSet<ExportRecord> Exports => Set<ExportRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("mzansi");
        OrganisationLink<AppUser>(modelBuilder);
        OrganisationLink<Invitation>(modelBuilder);
        OrganisationLink<SubscriptionRecord>(modelBuilder);
        OrganisationLink<CorrectionRequest>(modelBuilder);
        OrganisationLink<LeaveRequestRecord>(modelBuilder);
        OrganisationLink<AgentEvent>(modelBuilder);
        OrganisationLink<AuditRecord>(modelBuilder);
        OrganisationLink<EmailMessage>(modelBuilder);
        OrganisationLink<ExportRecord>(modelBuilder);
        UserLink<CorrectionRequest>(modelBuilder);
        UserLink<LeaveRequestRecord>(modelBuilder);
        UserLink<AgentEvent>(modelBuilder);
        modelBuilder.Entity<AppUser>().HasIndex(x => new { x.OrganisationId, x.Email }).IsUnique();
        modelBuilder.Entity<AgentEvent>().HasIndex(x => new { x.OrganisationId, x.IdempotencyKey }).IsUnique();
        modelBuilder.Entity<SubscriptionRecord>().Property(x => x.AmountDue).HasPrecision(12, 2);
        modelBuilder.Entity<LeaveRequestRecord>().Property(x => x.Days).HasPrecision(6, 2);
    }

    private static void OrganisationLink<T>(ModelBuilder modelBuilder) where T : class =>
        modelBuilder.Entity<T>().HasOne<Organisation>().WithMany().HasForeignKey("OrganisationId").OnDelete(DeleteBehavior.Restrict);

    private static void UserLink<T>(ModelBuilder modelBuilder) where T : class =>
        modelBuilder.Entity<T>().HasOne<AppUser>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Restrict);
}
