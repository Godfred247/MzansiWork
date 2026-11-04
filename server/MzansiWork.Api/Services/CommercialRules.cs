namespace MzansiWork.Api.Services;

public record PlanDefinition(string Id, string Name, int MinUsers, int? MaxUsers, decimal Monthly, decimal? Annual);

public static class CommercialRules
{
    public const decimal AnnualDiscount = 0.10m;
    public const decimal EnterpriseRate = 2.70m;
    public const decimal EnterpriseMinimum = 270m;

    public static readonly PlanDefinition[] Plans =
    [
        new("starter", "Starter", 1, 5, 89m, null),
        new("small", "Small Business", 6, 19, 119.99m, 1295.89m),
        new("medium", "Medium Business", 20, 39, 179.99m, 1943.89m),
        new("large", "Large Business", 40, 99, 229.99m, 2483.89m),
        new("enterprise", "Enterprise", 100, null, 270m, null)
    ];

    public static PlanDefinition Get(string id) => Plans.First(p => p.Id == id);

    public static int Rank(string id) => Array.FindIndex(Plans, p => p.Id == id);

    public static decimal MonthlyPrice(string id, int users) =>
        id == "enterprise" ? Math.Max(EnterpriseMinimum, Math.Round(users * EnterpriseRate, 2)) : Get(id).Monthly;

    public static decimal? AnnualPrice(string id, int users)
    {
        if (id == "starter") return null;
        if (id == "enterprise") return Math.Round(MonthlyPrice(id, users) * 12m * (1m - AnnualDiscount), 2);
        return Get(id).Annual;
    }

    public static int UserLimit(string id, int enterpriseUsers) =>
        id == "enterprise" ? enterpriseUsers : Get(id).MaxUsers!.Value;

    public static int AvailableSeats(int limit, int activeMembers, int pendingInvitations) =>
        Math.Max(0, limit - activeMembers - pendingInvitations);

    public static (bool Ok, string Message) ValidateSignup(string planId, string frequency, int users, int seatsUsed, bool confirmed)
    {
        if (!confirmed)
            return (false, "Confirm the paid plan before the organisation is created.");
        var plan = Plans.FirstOrDefault(p => p.Id == planId);
        if (plan is null)
            return (false, "Unknown plan.");
        if (frequency is not ("monthly" or "annual"))
            return (false, "Choose monthly or annual billing.");
        if (planId == "starter" && frequency == "annual")
            return (false, "Starter is monthly billing only.");
        if (frequency == "annual" && users < 6)
            return (false, "Annual billing is available for plans with 6 or more users.");
        if (users < plan.MinUsers)
            return (false, $"{plan.Name} starts at {plan.MinUsers} users.");
        if (plan.MaxUsers is int max && users > max)
            return (false, $"{plan.Name} allows up to {max} users.");
        var limit = UserLimit(planId, users);
        if (seatsUsed > limit)
            return (false, $"This plan allows {limit} users and this signup uses {seatsUsed}. Remove invitations or choose a larger plan. Nobody was created.");
        return (true, "Confirmed.");
    }

    public static (bool Ok, string Message, bool Immediate, decimal ChargeNow) EvaluateChange(
        string currentPlan,
        string currentFrequency,
        int currentEnterpriseUsers,
        string nextPlan,
        string nextFrequency,
        int nextUsers,
        int seatsUsed,
        bool confirmed)
    {
        if (!confirmed)
            return (false, "A plan or billing change requires explicit confirmation. Nothing was changed.", false, 0);
        if (nextPlan == "starter" && nextFrequency == "annual")
            return (false, "Starter is monthly billing only.", false, 0);
        if (!Plans.Any(p => p.Id == nextPlan))
            return (false, "Unknown plan.", false, 0);

        var limit = UserLimit(nextPlan, nextUsers);
        var enterpriseUserChange = nextPlan == "enterprise" && currentPlan == "enterprise" && nextUsers != currentEnterpriseUsers;
        var immediate = Rank(nextPlan) > Rank(currentPlan) || (enterpriseUserChange && nextUsers > currentEnterpriseUsers);
        if (nextPlan == currentPlan && nextFrequency == currentFrequency && !enterpriseUserChange)
            return (false, "That is already the current plan and billing frequency.", false, 0);
        if (seatsUsed > limit)
            return (false, $"This plan allows {limit} users and you are using {seatsUsed}. Reduce members or cancel invitations first. Nobody was deactivated.", false, 0);

        var price = nextFrequency == "annual"
            ? AnnualPrice(nextPlan, nextUsers) ?? MonthlyPrice(nextPlan, nextUsers)
            : MonthlyPrice(nextPlan, nextUsers);
        return (true, immediate ? "Confirmed. The new plan applies now." : "Confirmed. The change takes effect on the renewal date.", immediate, immediate ? price : 0);
    }
}
