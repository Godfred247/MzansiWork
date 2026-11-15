namespace MzansiWork.Api.Domain;

public class Organisation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Timezone { get; set; } = "Africa/Johannesburg";
    public string Contact { get; set; } = "";
    public string WorkingWeek { get; set; } = "Monday – Friday";
    public string StandardHours { get; set; } = "08:00 – 17:00";
    public int IdleThresholdMinutes { get; set; } = 5;
}

public class AppUser
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "employee";
    public string Department { get; set; } = "";
    public string Branch { get; set; } = "Cape Town";
    public string Status { get; set; } = "active";
    public bool BillingAccess { get; set; }
}

public class EmployeeWorkOptionsRecord
{
    public Guid OrganisationId { get; set; }
    public Guid UserId { get; set; }
    public string ProjectsJson { get; set; } = "[]";
    public string TasksJson { get; set; } = "[]";
    public string CategoriesJson { get; set; } = "[]";
}

public class Invitation
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string Email { get; set; } = "";
    public string Role { get; set; } = "employee";
    public string Department { get; set; } = "";
    public string Branch { get; set; } = "Cape Town";
    public string Status { get; set; } = "pending";
    public DateTimeOffset SentAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}

public class SubscriptionRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string PlanId { get; set; } = "small";
    public string Frequency { get; set; } = "monthly";
    public int EnterpriseUsers { get; set; } = 100;
    public DateOnly Renewal { get; set; }
    public string PaymentStatus { get; set; } = "paid";
    public string PaymentMethod { get; set; } = "Visa •••• 4821";
    public decimal? AmountDue { get; set; }
    public DateOnly? CancelEffective { get; set; }
    public string? ScheduledPlanId { get; set; }
    public string? ScheduledFrequency { get; set; }
}

public class CorrectionRequest
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid UserId { get; set; }
    public string Original { get; set; } = "";
    public string Requested { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Status { get; set; } = "pending";
    public string? DecisionReason { get; set; }
    public string? ReviewerName { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
}

public class LeaveRequestRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid UserId { get; set; }
    public string LeaveType { get; set; } = "annual";
    public DateOnly Start { get; set; }
    public DateOnly End { get; set; }
    public decimal Days { get; set; }
    public string Notes { get; set; } = "";
    public string Status { get; set; } = "pending";
    public string? DecisionReason { get; set; }
    public string? ReviewerName { get; set; }
}

public class LeavePolicyRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public bool Enabled { get; set; } = true;
    public bool TracksDays { get; set; }
    public string GrantMode { get; set; } = "upfront";
    public decimal? AllowanceDays { get; set; }
    public decimal? MonthlyDays { get; set; }
    public string Cycle { get; set; } = "year";
    public DateOnly CycleStart { get; set; }
    public string AppliesTo { get; set; } = "Everyone";
    public string EmployeeNote { get; set; } = "";
    public int SortOrder { get; set; }
}

public class LeaveOpeningRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid UserId { get; set; }
    public Guid PolicyId { get; set; }
    public decimal OpeningDays { get; set; }
    public DateOnly AsOf { get; set; }
}

public class AgentEvent
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid UserId { get; set; }
    public string IdempotencyKey { get; set; } = "";
    public string Kind { get; set; } = "";
    public DateTimeOffset OccurredAt { get; set; }
    public string Detail { get; set; } = "";
}

public class AuditRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string Actor { get; set; } = "";
    public string Action { get; set; } = "";
    public string Target { get; set; } = "";
    public string? Reason { get; set; }
    public string Category { get; set; } = "";
    public DateTimeOffset At { get; set; }
}

public class EmailMessage
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string ToAddress { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
    public string Status { get; set; } = "queued";
    public DateTimeOffset CreatedAt { get; set; }
}

public class ExportRecord
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public string Report { get; set; } = "";
    public string Format { get; set; } = "CSV";
    public string Range { get; set; } = "";
    public string DataType { get; set; } = "";
    public string Status { get; set; } = "done";
    public int Rows { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
