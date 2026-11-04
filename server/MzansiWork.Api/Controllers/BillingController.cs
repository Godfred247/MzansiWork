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
[Route("api/subscription")]
public class BillingController(AppDbContext db) : ControllerBase
{
    public record ChangeRequest(string PlanId, string Frequency, int Users, bool Confirm);
    public record PaymentRequest(string Action, bool Succeed, string? CardLast4);

    [HttpGet]
    public async Task<IActionResult> Current()
    {
        if (!CurrentUser.CanBill(User))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Billing is limited to the account owner unless it is explicitly delegated." });
        var sub = await db.Subscriptions.FirstAsync(x => x.OrganisationId == CurrentUser.Org(User));
        var price = sub.Frequency == "annual"
            ? CommercialRules.AnnualPrice(sub.PlanId, sub.EnterpriseUsers)
            : CommercialRules.MonthlyPrice(sub.PlanId, sub.EnterpriseUsers);
        return Ok(new { subscription = sub, price, plans = CommercialRules.Plans, note = "Proposed pricing. A change is applied only when confirm is true." });
    }

    [HttpPost("change")]
    public async Task<IActionResult> Change(ChangeRequest request)
    {
        if (!CurrentUser.CanBill(User)) return Forbid();
        var sub = await db.Subscriptions.FirstAsync(x => x.OrganisationId == CurrentUser.Org(User));
        var active = await db.Users.CountAsync(x => x.OrganisationId == sub.OrganisationId && x.Status == "active");
        var reserved = await db.Invitations.CountAsync(x => x.OrganisationId == sub.OrganisationId && x.Status == "pending");
        var decision = CommercialRules.EvaluateChange(sub.PlanId, sub.Frequency, sub.EnterpriseUsers, request.PlanId, request.Frequency, request.Users, active + reserved, request.Confirm);
        if (!decision.Ok) return Conflict(new { message = decision.Message });

        if (decision.Immediate)
        {
            sub.PlanId = request.PlanId;
            sub.Frequency = request.Frequency;
            if (request.PlanId == "enterprise") sub.EnterpriseUsers = request.Users;
        }
        else
        {
            sub.ScheduledPlanId = request.PlanId;
            sub.ScheduledFrequency = request.Frequency;
        }
        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = sub.OrganisationId,
            Actor = CurrentUser.Name(User),
            Action = decision.Immediate ? "Upgraded plan" : "Scheduled plan change",
            Target = $"{request.PlanId} · {request.Frequency}",
            Reason = "Explicitly confirmed by the owner",
            Category = "subscription",
            At = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();
        return Ok(new { subscription = sub, chargeNow = decision.ChargeNow, message = "Change recorded. No card was charged by a live gateway." });
    }

    [HttpPost("payment")]
    public async Task<IActionResult> Payment(PaymentRequest request)
    {
        if (!CurrentUser.CanBill(User)) return Forbid();
        var sub = await db.Subscriptions.FirstAsync(x => x.OrganisationId == CurrentUser.Org(User));
        if (request.Action == "fail")
        {
            sub.PaymentStatus = "failed";
            sub.AmountDue = sub.Frequency == "annual"
                ? CommercialRules.AnnualPrice(sub.PlanId, sub.EnterpriseUsers)
                : CommercialRules.MonthlyPrice(sub.PlanId, sub.EnterpriseUsers);
        }
        else if (request.Action == "retry")
        {
            if (!request.Succeed) return Conflict(new { message = "Payment declined again. The amount and billing frequency were not changed." });
            sub.PaymentStatus = "paid";
            sub.AmountDue = null;
        }
        else if (request.Action == "update-card" && request.CardLast4 is { Length: 4 })
        {
            sub.PaymentMethod = $"Visa •••• {request.CardLast4}";
        }
        else return BadRequest(new { message = "Unknown payment action." });
        await db.SaveChangesAsync();
        return Ok(sub);
    }
}
