using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MzansiWork.Api.Domain;

namespace MzansiWork.Api.Security;

public class TokenService(IConfiguration configuration)
{
    public string Create(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims:
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("org", user.OrganisationId.ToString()),
                new Claim("billing", user.BillingAccess ? "yes" : "no")
            ],
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public static class CurrentUser
{
    public static Guid Id(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public static Guid Org(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("org")!);
    public static string Role(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Role) ?? "employee";
    public static string Name(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Name) ?? "User";
    public static bool CanBill(ClaimsPrincipal user) => Role(user) == "owner" || user.FindFirstValue("billing") == "yes";
}
