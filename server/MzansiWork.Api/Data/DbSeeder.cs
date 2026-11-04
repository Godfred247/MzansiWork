using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;

namespace MzansiWork.Api.Data;

public static class DbSeeder
{
    public static readonly Guid OrgId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid OwnerId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid ThandiId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public static void Seed(AppDbContext db)
    {
        if (db.Organisations.Any()) return;
        var password = PasswordHasher.Hash("Password123");
        using var transaction = db.Database.BeginTransaction();
        db.Organisations.Add(new Organisation
        {
            Id = OrgId,
            Name = "Karoo Digital (Pty) Ltd",
            Contact = "hello@karoodigital.co.za",
            Timezone = "Africa/Johannesburg"
        });
        db.SaveChanges();
        db.Users.AddRange(
            User(OwnerId, "Lerato Mokoena", "lerato@karoodigital.co.za", "owner", "Leadership", true, password),
            User(ThandiId, "Thandi Nkosi", "thandi@karoodigital.co.za", "employee", "Design", false, password),
            User(Guid.NewGuid(), "Pieter van Wyk", "pieter@karoodigital.co.za", "manager", "Operations", false, password),
            User(Guid.NewGuid(), "Zanele Mthembu", "zanele@karoodigital.co.za", "employee", "Operations", false, password));
        db.SaveChanges();
        db.Invitations.Add(new Invitation
        {
            Id = Guid.NewGuid(),
            OrganisationId = OrgId,
            Email = "keabetswe@karoodigital.co.za",
            Role = "employee",
            Department = "Design",
            Branch = "Johannesburg",
            Status = "pending",
            SentAt = DateTimeOffset.UtcNow.AddDays(-2),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(5)
        });
        db.Subscriptions.Add(new SubscriptionRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = OrgId,
            PlanId = "small",
            Frequency = "monthly",
            Renewal = new DateOnly(2026, 11, 14),
            PaymentStatus = "paid"
        });
        db.Corrections.Add(new CorrectionRequest
        {
            Id = Guid.NewGuid(),
            OrganisationId = OrgId,
            UserId = ThandiId,
            Original = "Idle 15:10–15:35 (desktop agent observation)",
            Requested = "Classify as work — In-person meeting",
            Reason = "Client workshop away from the laptop.",
            Status = "pending",
            SubmittedAt = DateTimeOffset.UtcNow
        });
        db.LeaveRequests.Add(new LeaveRequestRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = OrgId,
            UserId = ThandiId,
            LeaveType = "annual",
            Start = new DateOnly(2026, 12, 21),
            End = new DateOnly(2026, 12, 23),
            Days = 3,
            Notes = "Year-end travel.",
            Status = "pending"
        });
        db.SaveChanges();
        transaction.Commit();
    }

    private static AppUser User(Guid id, string name, string email, string role, string department, bool billing, string hash) => new()
    {
        Id = id,
        OrganisationId = OrgId,
        FullName = name,
        Email = email,
        PasswordHash = hash,
        Role = role,
        Department = department,
        BillingAccess = billing
    };
}
