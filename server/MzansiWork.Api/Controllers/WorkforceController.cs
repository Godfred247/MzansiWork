using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Data;
using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;
using MzansiWork.Api.Services;

namespace MzansiWork.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class WorkforceController(AppDbContext db, IConfiguration configuration) : ControllerBase
{
    public record InviteRequest(string Email, string Role, string Department, string Branch);
    public record ReviewRequest(string Decision, string Reason);
    public record AgentEventRequest(string IdempotencyKey, string Kind, DateTimeOffset OccurredAt, string Detail);
    public record LeaveRequestBody(string LeaveType, DateOnly Start, DateOnly End, decimal Days, string Notes);

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var orgId = CurrentUser.Org(User);
        var members = await db.Users.Where(x => x.OrganisationId == orgId && x.Status == "active").ToListAsync();
        var pendingCorrections = await db.Corrections.CountAsync(x => x.OrganisationId == orgId && x.Status == "pending");
        var pendingLeave = await db.LeaveRequests.CountAsync(x => x.OrganisationId == orgId && x.Status == "pending");
        var seats = await SeatSnapshot(orgId);
        return Ok(new
        {
            organisation = await db.Organisations.FindAsync(orgId),
            activeMembers = members.Count,
            pendingCorrections,
            pendingLeave,
            seats,
            people = members.Select(x => new { x.Id, x.FullName, x.Email, x.Role, x.Department, x.Branch, x.Status })
        });
    }

    [HttpGet("workspace")]
    public async Task<IActionResult> Workspace()
    {
        var orgId = CurrentUser.Org(User);
        var org = await db.Organisations.FindAsync(orgId);
        var people = await db.Users.Where(x => x.OrganisationId == orgId && x.Status == "active").ToListAsync();
        var invitations = await db.Invitations.Where(x => x.OrganisationId == orgId).ToListAsync();
        var subscription = await db.Subscriptions.FirstAsync(x => x.OrganisationId == orgId);
        return Ok(new
        {
            organisation = org,
            people = people.Select(x => new { x.Id, x.FullName, x.Email, x.Role, x.Department, x.Branch, x.Status, x.BillingAccess }),
            invitations = invitations.Select(x => new { x.Id, x.Email, x.Role, x.Department, x.Branch, x.Status, x.SentAt, x.ExpiresAt }),
            subscription,
            seats = await SeatSnapshot(orgId),
            user = people.FirstOrDefault(x => x.Id == CurrentUser.Id(User)) is { } me
                ? new { me.Id, me.FullName, me.Email, me.Role, me.Department, me.Branch, me.BillingAccess }
                : null
        });
    }

    [HttpGet("corrections")]
    public async Task<IActionResult> Corrections()
    {
        var orgId = CurrentUser.Org(User);
        var rows = await db.Corrections.Where(x => x.OrganisationId == orgId).ToListAsync();
        return Ok(rows.OrderByDescending(x => x.SubmittedAt));
    }

    [HttpPost("corrections/{id:guid}/review")]
    public async Task<IActionResult> ReviewCorrection(Guid id, ReviewRequest request)
    {
        if (CurrentUser.Role(User) == "employee") return Forbid();
        if (request.Decision is "rejected" or "info_requested" && request.Reason.Trim().Length < 8)
            return BadRequest(new { message = "A reason is required when you reject a request or ask for more information." });
        var row = await db.Corrections.FirstOrDefaultAsync(x => x.Id == id && x.OrganisationId == CurrentUser.Org(User));
        if (row is null) return NotFound();
        row.Status = request.Decision;
        row.DecisionReason = request.Reason;
        row.ReviewerName = CurrentUser.Name(User);
        AddAudit("correction", $"{request.Decision} correction", row.Original, request.Reason);
        await db.SaveChangesAsync();
        return Ok(row);
    }

    [HttpGet("leave")]
    public async Task<IActionResult> Leave() =>
        Ok(await db.LeaveRequests.Where(x => x.OrganisationId == CurrentUser.Org(User)).ToListAsync());

    [HttpPost("leave")]
    public async Task<IActionResult> SubmitLeave(LeaveRequestBody body)
    {
        var row = new LeaveRequestRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = CurrentUser.Org(User),
            UserId = CurrentUser.Id(User),
            LeaveType = body.LeaveType,
            Start = body.Start,
            End = body.End,
            Days = body.Days,
            Notes = body.Notes,
            Status = "pending"
        };
        db.LeaveRequests.Add(row);
        await db.SaveChangesAsync();
        return Ok(row);
    }

    [HttpPost("leave/{id:guid}/review")]
    public async Task<IActionResult> ReviewLeave(Guid id, ReviewRequest request)
    {
        if (CurrentUser.Role(User) == "employee") return Forbid();
        if (request.Decision is "rejected" or "info_requested" && request.Reason.Trim().Length < 8)
            return BadRequest(new { message = "Give the employee a reason." });
        var row = await db.LeaveRequests.FirstOrDefaultAsync(x => x.Id == id && x.OrganisationId == CurrentUser.Org(User));
        if (row is null) return NotFound();
        row.Status = request.Decision;
        row.DecisionReason = request.Reason;
        row.ReviewerName = CurrentUser.Name(User);
        AddAudit("leave", $"{request.Decision} leave", row.LeaveType, request.Reason);
        await db.SaveChangesAsync();
        return Ok(row);
    }

    [HttpPost("invitations")]
    public async Task<IActionResult> Invite(InviteRequest request)
    {
        var role = CurrentUser.Role(User);
        if (role is not ("owner" or "manager")) return Forbid();
        var email = request.Email.Trim().ToLowerInvariant();
        var orgId = CurrentUser.Org(User);
        var seats = await SeatSnapshot(orgId);
        if (seats.Available <= 0)
            return Conflict(new { message = "No seats available. The invitation was not sent and the plan was not changed.", seats });
        if (await db.Users.AnyAsync(x => x.OrganisationId == orgId && x.Email == email && x.Status == "active"))
            return Conflict(new { message = "This person already belongs to the organisation." });
        if (await db.Invitations.AnyAsync(x => x.OrganisationId == orgId && x.Email == email && x.Status == "pending"))
            return Conflict(new { message = "A pending invitation already reserves a seat for this email." });

        var invite = new Invitation
        {
            Id = Guid.NewGuid(),
            OrganisationId = orgId,
            Email = email,
            Role = request.Role,
            Department = request.Department,
            Branch = request.Branch,
            Status = "pending",
            SentAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        };
        db.Invitations.Add(invite);
        db.Emails.Add(new EmailMessage
        {
            Id = Guid.NewGuid(),
            OrganisationId = orgId,
            ToAddress = email,
            Subject = "You’re invited to Karoo Digital (Pty) Ltd on MzansiWork",
            Body = $"You have been invited as a {request.Role} in {request.Department}. The link expires in 7 days and reserves one seat. Employees do not buy their own subscription.",
            Status = string.IsNullOrWhiteSpace(configuration["SendGrid:ApiKey"]) ? "queued" : "ready",
            CreatedAt = DateTimeOffset.UtcNow
        });
        AddAudit("invitation", "Sent invitation", email, null);
        await db.SaveChangesAsync();
        return Ok(new { invite, seats = await SeatSnapshot(orgId) });
    }

    [HttpPost("invitations/{id:guid}/cancel")]
    public async Task<IActionResult> CancelInvite(Guid id)
    {
        var invite = await db.Invitations.FirstOrDefaultAsync(x => x.Id == id && x.OrganisationId == CurrentUser.Org(User) && x.Status == "pending");
        if (invite is null) return NotFound();
        invite.Status = "cancelled";
        AddAudit("invitation", "Cancelled invitation", invite.Email, "Seat released");
        await db.SaveChangesAsync();
        return Ok(new { invite, seats = await SeatSnapshot(invite.OrganisationId) });
    }

    [HttpPost("agent/events")]
    public async Task<IActionResult> AgentEvents(List<AgentEventRequest> events)
    {
        var orgId = CurrentUser.Org(User);
        var userId = CurrentUser.Id(User);
        var accepted = 0;
        var duplicates = 0;
        foreach (var item in events)
        {
            if (await db.AgentEvents.AnyAsync(x => x.OrganisationId == orgId && x.IdempotencyKey == item.IdempotencyKey))
            {
                duplicates++;
                continue;
            }
            db.AgentEvents.Add(new AgentEvent
            {
                Id = Guid.NewGuid(),
                OrganisationId = orgId,
                UserId = userId,
                IdempotencyKey = item.IdempotencyKey,
                Kind = item.Kind,
                OccurredAt = item.OccurredAt,
                Detail = item.Detail
            });
            accepted++;
        }
        await db.SaveChangesAsync();
        return Ok(new { accepted, duplicates, message = "Idle observations are recorded. They are not treated as proof that the employee was not working." });
    }

    [HttpGet("emails")]
    public async Task<IActionResult> Emails()
    {
        if (!CurrentUser.CanBill(User) && CurrentUser.Role(User) != "owner") return Forbid();
        var emails = await db.Emails.Where(x => x.OrganisationId == CurrentUser.Org(User)).ToListAsync();
        return Ok(emails.OrderByDescending(x => x.CreatedAt));
    }

    private async Task<SeatView> SeatSnapshot(Guid orgId)
    {
        var now = DateTimeOffset.UtcNow;
        var sub = await db.Subscriptions.FirstAsync(x => x.OrganisationId == orgId);
        var active = await db.Users.CountAsync(x => x.OrganisationId == orgId && x.Status == "active");
        var pending = await db.Invitations.Where(x => x.OrganisationId == orgId && x.Status == "pending").ToListAsync();
        var reserved = pending.Count(x => x.ExpiresAt > now);
        var limit = CommercialRules.UserLimit(sub.PlanId, sub.EnterpriseUsers);
        return new SeatView(sub.PlanId, limit, active, reserved, CommercialRules.AvailableSeats(limit, active, reserved));
    }

    private void AddAudit(string category, string action, string target, string? reason)
    {
        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = CurrentUser.Org(User),
            Actor = CurrentUser.Name(User),
            Action = action,
            Target = target,
            Reason = reason,
            Category = category,
            At = DateTimeOffset.UtcNow
        });
    }

    public record SeatView(string PlanId, int Limit, int Active, int Reserved, int Available);
}
