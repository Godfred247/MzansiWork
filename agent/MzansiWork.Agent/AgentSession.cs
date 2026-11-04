using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace MzansiWork.Agent;

public sealed class QueuedEvent
{
    public string IdempotencyKey { get; set; } = "";
    public string Kind { get; set; } = "";
    public DateTimeOffset OccurredAt { get; set; }
    public string Detail { get; set; } = "";
}

public sealed class AgentSession
{
    private static readonly string Folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MzansiWork");
    private static readonly string QueuePath = Path.Combine(Folder, "queue.json");
    private readonly HttpClient http = new() { BaseAddress = new Uri("http://localhost:5080") };
    private readonly List<QueuedEvent> queue = [];

    public string? Token { get; private set; }
    public string EmployeeName { get; private set; } = "";
    public string Organisation { get; private set; } = "";
    public string Status { get; private set; } = "Not signed in";
    public string SyncMessage { get; private set; } = "Not synchronised yet";
    public bool Tracking { get; private set; }
    public bool Paused { get; private set; }
    public int Pending => queue.Count;

    public AgentSession()
    {
        Directory.CreateDirectory(Folder);
        if (File.Exists(QueuePath))
        {
            var saved = JsonSerializer.Deserialize<List<QueuedEvent>>(File.ReadAllText(QueuePath));
            if (saved is not null) queue.AddRange(saved);
        }
    }

    public async Task<string?> SignIn(string email, string password)
    {
        var response = await http.PostAsJsonAsync("/api/auth/login", new { email, password });
        if (!response.IsSuccessStatusCode) return "Email or password is incorrect.";
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Token = body?.Token;
        EmployeeName = body?.User.FullName ?? email;
        Organisation = body?.Organisation?.Name ?? "";
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        Tracking = true;
        Paused = false;
        Status = "Tracking active";
        Enqueue("session_started", "Authorised work session started from the desktop agent.");
        return null;
    }

    public void SignOut()
    {
        if (Tracking) Enqueue("session_stopped", "Employee signed out. Tracking stopped.");
        Token = null;
        Tracking = false;
        Paused = false;
        Status = "Not signed in";
        http.DefaultRequestHeaders.Authorization = null;
    }

    public void SetPaused(bool paused)
    {
        if (!Tracking) return;
        Paused = paused;
        Status = paused ? "Tracking paused" : "Tracking active";
        Enqueue(paused ? "tracking_paused" : "tracking_resumed", paused
            ? "Employee paused observations. Collection stops while paused."
            : "Employee resumed observations.");
    }

    public void ObserveIdle(bool idle, int thresholdMinutes)
    {
        if (!Tracking || Paused) return;
        if (idle)
        {
            Status = "Idle interval detected";
            Enqueue("idle_started", $"Operating system reported no input for {thresholdMinutes} minutes. This is an observation, not proof that work stopped.");
        }
        else
        {
            Status = "Tracking active";
            Enqueue("active_resumed", "Operating system input resumed.");
        }
    }

    public async Task Sync()
    {
        if (Token is null)
        {
            SyncMessage = "Sign in before synchronising.";
            return;
        }
        if (queue.Count == 0)
        {
            SyncMessage = "Connected. Nothing waiting.";
            return;
        }
        Status = "Synchronising";
        try
        {
            var response = await http.PostAsJsonAsync("/api/agent/events", queue.ToArray());
            if (!response.IsSuccessStatusCode)
            {
                Status = "Offline: events saved locally";
                SyncMessage = "The server did not accept the events. They remain on this computer.";
                return;
            }
            var result = await response.Content.ReadFromJsonAsync<SyncResponse>();
            queue.Clear();
            File.WriteAllText(QueuePath, "[]");
            Status = Paused ? "Tracking paused" : "Tracking active";
            SyncMessage = $"Synchronised {result?.Accepted ?? 0}. Duplicates skipped: {result?.Duplicates ?? 0}.";
        }
        catch (HttpRequestException)
        {
            Status = "Offline: events saved locally";
            SyncMessage = $"{queue.Count} events are saved on this computer. They have not reached the server.";
        }
    }

    private void Enqueue(string kind, string detail)
    {
        queue.Add(new QueuedEvent
        {
            IdempotencyKey = Guid.NewGuid().ToString("N"),
            Kind = kind,
            OccurredAt = DateTimeOffset.Now,
            Detail = detail
        });
        File.WriteAllText(QueuePath, JsonSerializer.Serialize(queue));
    }

    private sealed record LoginResponse(string Token, LoginUser User, LoginOrg? Organisation);
    private sealed record LoginUser(string FullName);
    private sealed record LoginOrg(string Name);
    private sealed record SyncResponse(int Accepted, int Duplicates);
}
