using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Data;
using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;
using MzansiWork.Api.Services;

namespace MzansiWork.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens, ILogger<AuthController> log) : ControllerBase
{
    public record LoginRequest(string Email, string Password);
    public record ForgotRequest(string Email);
    public record RegisterInvite(string Email, string Role, string Department, string? Branch);
    public record RegisterRequest(
        string FullName,
        string Email,
        string Password,
        string OrganisationName,
        string PlanId,
        string Frequency,
        int Users,
        bool Confirm,
        string? Timezone,
        string? Contact,
        string? WorkingWeek,
        string? StandardHours,
        List<RegisterInvite>? Invites);
    public record AcceptRequest(string Email, string FullName, string Password);
    public record InvitationLookupRequest(string Email);

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var name = request.FullName.Trim();
        var orgName = request.OrganisationName.Trim();
        if (name.Length < 2) return BadRequest(new { message = "Enter the owner's full name." });
        if (!email.Contains('@') || email.Length < 6) return BadRequest(new { message = "Enter a valid work email." });
        if (!PasswordOk(request.Password)) return BadRequest(new { message = "Use at least 10 characters, with letters and a number." });
        if (orgName.Length < 2) return BadRequest(new { message = "Enter the organisation name." });
        var contact = request.Contact?.Trim() ?? "";
        if (!contact.Contains('@') || contact.Length < 6) return BadRequest(new { message = "Enter a business contact email." });
        if (await db.Users.AnyAsync(x => x.Email == email))
            return Conflict(new { message = "An account already uses this email. Sign in or reset the password instead." });

        var invites = (request.Invites ?? []).Select(x => new RegisterInvite(x.Email.Trim().ToLowerInvariant(), x.Role.Trim().ToLowerInvariant(), x.Department.Trim(), string.IsNullOrWhiteSpace(x.Branch) ? "" : x.Branch.Trim())).Where(x => x.Email.Length > 0).ToList();
        if (invites.Any(x => x.Email == email))
            return Conflict(new { message = "The owner is already a member. Remove that invitation." });
        if (invites.Select(x => x.Email).Distinct().Count() != invites.Count)
            return Conflict(new { message = "Each person only needs one invitation." });
        if (invites.Any(x => x.Role is not ("employee" or "manager")))
            return BadRequest(new { message = "An invitation can be for an employee or a manager." });
        if (invites.Any(x => !x.Email.Contains('@')))
            return BadRequest(new { message = "Check the invitation email addresses." });

        var decision = CommercialRules.ValidateSignup(request.PlanId, request.Frequency, request.Users, 1 + invites.Count, request.Confirm);
        if (!decision.Ok) return Conflict(new { message = decision.Message });

        var org = new Organisation
        {
            Id = Guid.NewGuid(),
            Name = orgName,
            Contact = contact,
            Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? "Africa/Johannesburg" : request.Timezone.Trim(),
            WorkingWeek = string.IsNullOrWhiteSpace(request.WorkingWeek) ? "Monday – Friday" : request.WorkingWeek.Trim(),
            StandardHours = string.IsNullOrWhiteSpace(request.StandardHours) ? "08:00 – 17:00" : request.StandardHours.Trim()
        };
        var owner = new AppUser
        {
            Id = Guid.NewGuid(),
            OrganisationId = org.Id,
            FullName = name,
            Email = email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = "owner",
            Department = "Leadership",
            Branch = "",
            Status = "active",
            BillingAccess = true
        };
        var renewal = request.Frequency == "annual" ? DateOnly.FromDateTime(DateTime.UtcNow).AddYears(1) : DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(1);
        var subscription = new SubscriptionRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = org.Id,
            PlanId = request.PlanId,
            Frequency = request.Frequency,
            EnterpriseUsers = request.PlanId == "enterprise" ? request.Users : 100,
            Renewal = renewal,
            PaymentStatus = "paid",
            PaymentMethod = "Confirmed at signup"
        };
        await using var transaction = await db.Database.BeginTransactionAsync();
        db.Organisations.Add(org);
        await db.SaveChangesAsync();
        db.Users.Add(owner);
        await db.SaveChangesAsync();
        db.Subscriptions.Add(subscription);
        foreach (var invite in invites)
        {
            db.Invitations.Add(new Invitation
            {
                Id = Guid.NewGuid(),
                OrganisationId = org.Id,
                Email = invite.Email,
                Role = invite.Role,
                Department = string.IsNullOrWhiteSpace(invite.Department) ? "General" : invite.Department,
                Branch = string.IsNullOrWhiteSpace(invite.Branch) ? "" : invite.Branch.Trim(),
                Status = "pending",
                SentAt = DateTimeOffset.UtcNow,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
            });
            db.Emails.Add(new EmailMessage
            {
                Id = Guid.NewGuid(),
                OrganisationId = org.Id,
                ToAddress = invite.Email,
                Subject = $"You’re invited to {org.Name} on MzansiWork",
                Body = $"You have been invited as a {invite.Role}. The link expires in 7 days and reserves one seat.",
                Status = "queued",
                CreatedAt = DateTimeOffset.UtcNow
            });
        }
        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = org.Id,
            Actor = name,
            Action = "Created organisation",
            Target = org.Name,
            Reason = $"{request.PlanId} · {request.Frequency} · confirmed",
            Category = "subscription",
            At = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        log.LogInformation("Created organisation {Organisation} for {Email} on {Plan} {Frequency} with {Invites} invitations", org.Name, email, request.PlanId, request.Frequency, invites.Count);
        return Ok(new { token = tokens.Create(owner), user = new { owner.Id, owner.FullName, owner.Email, owner.Role, owner.BillingAccess }, organisation = new { org.Id, org.Name } });
    }

    [HttpPost("invitation")]
    public async Task<IActionResult> Invitation(InvitationLookupRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (!email.Contains('@') || email.Length < 6) return BadRequest(new { message = "Enter a valid work email." });
        if (await db.Users.AnyAsync(x => x.Email == email && x.Status == "active"))
            return Ok(new { status = "account" });

        var now = DateTimeOffset.UtcNow;
        var invites = await db.Invitations.Where(x => x.Email == email).OrderByDescending(x => x.SentAt).ToListAsync();
        var pending = invites.FirstOrDefault(x => x.Status == "pending" && x.ExpiresAt > now);
        if (pending is not null)
        {
            var org = await db.Organisations.FindAsync(pending.OrganisationId);
            return Ok(new
            {
                status = "pending",
                organisationName = org?.Name ?? "Your organisation",
                role = pending.Role,
                department = pending.Department,
                branch = pending.Branch,
                expiresAt = pending.ExpiresAt
            });
        }

        if (invites.Any(x => x.Status == "pending")) return Ok(new { status = "expired" });
        if (invites.Any(x => x.Status == "cancelled")) return Ok(new { status = "cancelled" });
        return Ok(new { status = "none" });
    }

    [HttpPost("accept-invitation")]
    public async Task<IActionResult> Accept(AcceptRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var name = request.FullName.Trim();
        if (name.Length < 2) return BadRequest(new { message = "Enter your full name." });
        if (!PasswordOk(request.Password)) return BadRequest(new { message = "Use at least 10 characters, with letters and a number." });
        if (await db.Users.AnyAsync(x => x.Email == email && x.Status == "active"))
            return Conflict(new { message = "This email already has an account. Sign in instead." });

        var now = DateTimeOffset.UtcNow;
        var invite = await db.Invitations
            .Where(x => x.Email == email && x.Status == "pending" && x.ExpiresAt > now)
            .OrderByDescending(x => x.SentAt)
            .FirstOrDefaultAsync();
        if (invite is null)
        {
            log.LogInformation("Invitation acceptance failed for {Email}: no pending invitation", email);
            return NotFound(new { message = "There is no valid invitation for this email. Ask the organisation to send a new one." });
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            OrganisationId = invite.OrganisationId,
            FullName = name,
            Email = email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = invite.Role,
            Department = invite.Department,
            Branch = invite.Branch,
            Status = "active",
            BillingAccess = false
        };
        invite.Status = "accepted";
        db.Users.Add(user);
        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = invite.OrganisationId,
            Actor = name,
            Action = "Accepted invitation",
            Target = email,
            Category = "invitation",
            At = now
        });
        await db.SaveChangesAsync();
        log.LogInformation("Accepted invitation for {Email} into organisation {OrganisationId}", email, invite.OrganisationId);
        return Ok(new { token = tokens.Create(user), user = new { user.Id, user.FullName, user.Email, user.Role, user.BillingAccess } });
    }

    private static bool PasswordOk(string password) =>
        password.Length >= 10 && password.Any(char.IsLetter) && password.Any(char.IsDigit);

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email && x.Status == "active");
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            log.LogInformation("Sign-in failed for {Email}", email);
            return Unauthorized(new { message = "Email or password is incorrect." });
        }
        log.LogInformation("Signed in {Email} as {Role}", email, user.Role);

        var org = await db.Organisations.FindAsync(user.OrganisationId);
        return Ok(new
        {
            token = tokens.Create(user),
            user = new { user.Id, user.FullName, user.Email, user.Role, user.Department, user.BillingAccess },
            organisation = org is null ? null : new { org.Id, org.Name, org.Timezone }
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot(ForgotRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is not null)
        {
            db.Emails.Add(new EmailMessage
            {
                Id = Guid.NewGuid(),
                OrganisationId = user.OrganisationId,
                ToAddress = user.Email,
                Subject = "Reset your MzansiWork password",
                Body = "A password reset was requested. The link expires in 30 minutes. The current password is never included.",
                Status = "queued",
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }
        return Ok(new { message = "If that email belongs to an account, a reset link has been queued." });
    }
}
