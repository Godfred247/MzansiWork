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
        if (db.Organisations.Any())
        {
            RefreshDemoOrganisation(db);
            return;
        }

        var password = PasswordHasher.Hash("Password123");
        using var transaction = db.Database.BeginTransaction();
        db.Organisations.Add(new Organisation
        {
            Id = OrgId,
            Name = "Mzansi Work (Pty) Ltd",
            Contact = "hello@mzansiwork.co.za",
            Timezone = "Africa/Johannesburg"
        });
        db.SaveChanges();
        db.Users.AddRange(
            User(OwnerId, "Lerato Mokoena", "lerato@mzansiwork.co.za", "owner", "Leadership", true, password),
            User(ThandiId, "Thandi Nkosi", "thandi@mzansiwork.co.za", "employee", "Design", false, password),
            User(Guid.NewGuid(), "Pieter van Wyk", "pieter@mzansiwork.co.za", "manager", "Operations", false, password),
            User(Guid.NewGuid(), "Zanele Mthembu", "zanele@mzansiwork.co.za", "employee", "Operations", false, password));
        db.SaveChanges();
        db.Invitations.Add(new Invitation
        {
            Id = Guid.NewGuid(),
            OrganisationId = OrgId,
            Email = "keabetswe@mzansiwork.co.za",
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

    private static void RefreshDemoOrganisation(AppDbContext db)
    {
        var organisation = db.Organisations.Find(OrgId);
        if (organisation is null) return;

        var changed = false;
        if (organisation.Name != "Mzansi Work (Pty) Ltd")
        {
            organisation.Name = "Mzansi Work (Pty) Ltd";
            changed = true;
        }

        if (organisation.Contact != "hello@mzansiwork.co.za")
        {
            organisation.Contact = "hello@mzansiwork.co.za";
            changed = true;
        }

        foreach (var user in db.Users.Where(user => user.OrganisationId == OrgId))
        {
            var email = WithDemoEmailDomain(user.Email);
            if (email == user.Email) continue;
            user.Email = email;
            changed = true;
        }

        foreach (var invitation in db.Invitations.Where(invitation => invitation.OrganisationId == OrgId))
        {
            var email = WithDemoEmailDomain(invitation.Email);
            if (email == invitation.Email) continue;
            invitation.Email = email;
            changed = true;
        }

        if (changed) db.SaveChanges();
    }

    private static string WithDemoEmailDomain(string email)
    {
        var separator = email.LastIndexOf('@');
        return separator < 0 ? email : $"{email[..separator]}@mzansiwork.co.za";
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
