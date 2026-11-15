using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Data;
using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;

namespace MzansiWork.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/leave")]
public class LeavePolicyController(AppDbContext db) : ControllerBase
{
    public record PolicyBody(Guid Id, string Code, string Name, bool Enabled, bool TracksDays, string Grant, decimal? AllowanceDays, decimal? MonthlyDays, string Cycle, DateOnly CycleStart, string AppliesTo, string Note, int Sort);
    public record PolicyListBody(List<PolicyBody> Policies);
    public record OpeningBody(Guid PolicyId, Guid UserId, decimal? OpeningDays, DateOnly AsOf);

    [HttpGet("policy")]
    public async Task<IActionResult> Get()
    {
        var orgId = CurrentUser.Org(User);
        var policies = await db.LeavePolicies.Where(x => x.OrganisationId == orgId).OrderBy(x => x.SortOrder).ToListAsync();
        var openings = db.LeaveOpenings.Where(x => x.OrganisationId == orgId);
        var requests = db.LeaveRequests.Where(x => x.OrganisationId == orgId);
        if (CurrentUser.Role(User) == "employee")
        {
            var me = CurrentUser.Id(User);
            openings = openings.Where(x => x.UserId == me);
            requests = requests.Where(x => x.UserId == me);
        }

        return Ok(new
        {
            policies = policies.Select(ToDto),
            openings = await openings.Select(x => new { policyId = x.PolicyId, userId = x.UserId, openingDays = x.OpeningDays, asOf = x.AsOf }).ToListAsync(),
            requests = await requests.Select(x => new { x.Id, x.UserId, x.LeaveType, x.Start, x.End, x.Days, x.Notes, x.Status, x.DecisionReason, x.ReviewerName }).ToListAsync()
        });
    }

    [HttpPut("policy")]
    public async Task<IActionResult> Save(PolicyListBody body)
    {
        if (CurrentUser.Role(User) != "owner")
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only the owner can change leave policy." });
        var incoming = body.Policies ?? [];
        if (incoming.Count > 20) return BadRequest(new { message = "An organisation can have up to 20 leave types." });
        var error = Validate(incoming);
        if (error is not null) return BadRequest(new { message = error });

        var orgId = CurrentUser.Org(User);
        var existing = await db.LeavePolicies.Where(x => x.OrganisationId == orgId).ToListAsync();
        var kept = new List<LeavePolicyRecord>();
        var usedCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var sort = 0;
        foreach (var item in incoming)
        {
            var row = existing.FirstOrDefault(x => x.Id == item.Id);
            var code = row?.Code ?? UniqueCode(item.Code, item.Name, usedCodes);
            usedCodes.Add(code);
            if (row is null)
            {
                row = new LeavePolicyRecord { Id = item.Id == Guid.Empty ? Guid.NewGuid() : item.Id, OrganisationId = orgId, Code = code };
                db.LeavePolicies.Add(row);
            }
            row.Name = item.Name.Trim();
            row.Enabled = item.Enabled;
            row.TracksDays = item.TracksDays && item.Grant != "none";
            row.GrantMode = row.TracksDays ? item.Grant : "none";
            row.AllowanceDays = row.TracksDays ? item.AllowanceDays : null;
            row.MonthlyDays = row.GrantMode == "monthly" ? item.MonthlyDays : null;
            row.Cycle = item.Cycle is "year" or "months36" or "event" ? item.Cycle : "year";
            row.CycleStart = item.CycleStart;
            row.AppliesTo = item.AppliesTo.Trim();
            row.EmployeeNote = item.Note.Trim();
            row.SortOrder = sort++;
            kept.Add(row);
        }

        var removed = existing.Where(x => kept.All(row => row.Id != x.Id)).ToList();
        if (removed.Count > 0)
        {
            var removedIds = removed.Select(x => x.Id).ToList();
            var openings = await db.LeaveOpenings.Where(x => x.OrganisationId == orgId && removedIds.Contains(x.PolicyId)).ToListAsync();
            db.LeaveOpenings.RemoveRange(openings);
            db.LeavePolicies.RemoveRange(removed);
        }

        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = orgId,
            Actor = CurrentUser.Name(User),
            Action = "Updated leave policy",
            Target = $"{kept.Count} leave type{(kept.Count == 1 ? "" : "s")}",
            Reason = "Balances are the organisation's own figures.",
            Category = "leave",
            At = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();
        return Ok(kept.OrderBy(x => x.SortOrder).Select(ToDto));
    }

    [HttpPut("openings")]
    public async Task<IActionResult> Opening(OpeningBody body)
    {
        if (CurrentUser.Role(User) != "owner")
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only the owner can set a starting balance." });
        var orgId = CurrentUser.Org(User);
        var policy = await db.LeavePolicies.FirstOrDefaultAsync(x => x.Id == body.PolicyId && x.OrganisationId == orgId);
        if (policy is null) return NotFound(new { message = "That leave type is not in this organisation." });
        if (!await db.Users.AnyAsync(x => x.Id == body.UserId && x.OrganisationId == orgId && x.Status == "active"))
            return BadRequest(new { message = "Choose an active person in this organisation." });
        var row = await db.LeaveOpenings.FirstOrDefaultAsync(x => x.OrganisationId == orgId && x.PolicyId == body.PolicyId && x.UserId == body.UserId);
        if (body.OpeningDays is null)
        {
            if (row is not null) db.LeaveOpenings.Remove(row);
            await db.SaveChangesAsync();
            return Ok(new { cleared = true });
        }
        if (body.OpeningDays is < 0 or > 60) return BadRequest(new { message = "A starting balance must be between 0 and 60 days." });
        if (row is null)
        {
            row = new LeaveOpeningRecord { Id = Guid.NewGuid(), OrganisationId = orgId, PolicyId = body.PolicyId, UserId = body.UserId };
            db.LeaveOpenings.Add(row);
        }
        row.OpeningDays = body.OpeningDays.Value;
        row.AsOf = body.AsOf;
        await db.SaveChangesAsync();
        return Ok(new { policyId = row.PolicyId, userId = row.UserId, openingDays = row.OpeningDays, asOf = row.AsOf });
    }

    private static object ToDto(LeavePolicyRecord row) => new
    {
        id = row.Id,
        code = row.Code,
        name = row.Name,
        enabled = row.Enabled,
        tracksDays = row.TracksDays,
        grant = row.GrantMode,
        allowanceDays = row.AllowanceDays,
        monthlyDays = row.MonthlyDays,
        cycle = row.Cycle,
        cycleStart = row.CycleStart,
        appliesTo = row.AppliesTo,
        note = row.EmployeeNote,
        sort = row.SortOrder
    };

    private static string? Validate(List<PolicyBody> policies)
    {
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var policy in policies)
        {
            var name = policy.Name.Trim();
            if (name.Length is < 2 or > 60) return "Each leave type needs a name of 2 to 60 characters.";
            if (!names.Add(name)) return "Two leave types cannot share the same name.";
            var applies = policy.AppliesTo.Trim();
            if (applies.Length is < 2 or > 160) return "Say who the leave type applies to, in 160 characters or fewer.";
            if (policy.Note.Trim().Length > 300) return "The note employees see must be 300 characters or fewer.";
            if (policy.CycleStart == default) return "Choose the date the cycle starts.";
            if (!policy.TracksDays || policy.Grant == "none") continue;
            if (policy.Grant is not ("upfront" or "monthly")) return "Choose a full allowance or a month-end addition.";
            if (policy.AllowanceDays is < 0.5m or > 60) return "A cycle allowance must be between 0.5 and 60 days.";
            if (policy.Grant == "monthly")
            {
                if (policy.MonthlyDays is null or < 0.25m or > 5) return "The month-end amount must be between 0.25 and 5 days.";
                if (policy.AllowanceDays is decimal cap && cap < policy.MonthlyDays) return "The cycle limit cannot be smaller than one month's addition.";
            }
        }
        return null;
    }

    private static string UniqueCode(string requested, string name, HashSet<string> used)
    {
        var seed = Slug(string.IsNullOrWhiteSpace(requested) ? name : requested);
        var code = seed;
        var suffix = 2;
        while (used.Contains(code))
        {
            code = $"{seed}-{suffix}";
            suffix++;
        }
        return code;
    }

    private static string Slug(string value)
    {
        var chars = value.Trim().ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        var slug = new string(chars).Trim('-');
        while (slug.Contains("--", StringComparison.Ordinal)) slug = slug.Replace("--", "-", StringComparison.Ordinal);
        if (slug.Length > 40) slug = slug[..40].Trim('-');
        return slug.Length < 2 ? "leave" : slug;
    }
}
