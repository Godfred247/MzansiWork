using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Data;
using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;

namespace MzansiWork.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/employee/work-options")]
public class EmployeeWorkOptionsController(AppDbContext db) : ControllerBase
{
    public record WorkProject(Guid Id, string Name);
    public record WorkTask(Guid Id, Guid ProjectId, string Name);
    public record WorkOptionsRequest(List<WorkProject> Projects, List<WorkTask> Tasks, List<string> Categories);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var (orgId, userId) = CurrentScope();
        if (userId is null) return Forbid();

        var row = await db.EmployeeWorkOptions.FindAsync(orgId, userId.Value);
        return Ok(row is null
            ? new WorkOptionsRequest([], [], [])
            : new WorkOptionsRequest(
                JsonSerializer.Deserialize<List<WorkProject>>(row.ProjectsJson)!,
                JsonSerializer.Deserialize<List<WorkTask>>(row.TasksJson)!,
                JsonSerializer.Deserialize<List<string>>(row.CategoriesJson)!));
    }

    [HttpPut]
    public async Task<IActionResult> Save(WorkOptionsRequest request)
    {
        var (orgId, userId) = CurrentScope();
        if (userId is null) return Forbid();
        if (request.Projects.Count > 100 || request.Tasks.Count > 500 || request.Categories.Count > 100)
            return BadRequest(new { message = "You’ve reached the limit for personal work options." });

        var projectNames = request.Projects.Select(x => x.Name.Trim()).ToList();
        var taskNames = request.Tasks.Select(x => x.Name.Trim()).ToList();
        var categories = request.Categories.Select(x => x.Trim()).ToList();
        if (request.Projects.Any(x => x.Id == Guid.Empty) ||
            request.Tasks.Any(x => x.Id == Guid.Empty || x.ProjectId == Guid.Empty) ||
            projectNames.Any(x => x.Length is < 1 or > 100) ||
            taskNames.Any(x => x.Length is < 1 or > 100) ||
            categories.Any(x => x.Length is < 1 or > 80))
            return BadRequest(new { message = "Project, task and category names must be between 1 and 100 characters." });
        if (projectNames.Distinct(StringComparer.OrdinalIgnoreCase).Count() != projectNames.Count ||
            request.Projects.Select(x => x.Id).Distinct().Count() != request.Projects.Count ||
            request.Tasks.Select(x => x.Id).Distinct().Count() != request.Tasks.Count ||
            categories.Distinct(StringComparer.OrdinalIgnoreCase).Count() != categories.Count)
            return BadRequest(new { message = "Names and IDs must be unique." });

        var row = await db.EmployeeWorkOptions.FindAsync(orgId, userId.Value);
        if (row is null)
        {
            row = new EmployeeWorkOptionsRecord { OrganisationId = orgId, UserId = userId.Value };
            db.EmployeeWorkOptions.Add(row);
        }

        row.ProjectsJson = JsonSerializer.Serialize(request.Projects.Select((x, i) => x with { Name = projectNames[i] }));
        row.TasksJson = JsonSerializer.Serialize(request.Tasks.Select((x, i) => x with { Name = taskNames[i] }));
        row.CategoriesJson = JsonSerializer.Serialize(categories);
        await db.SaveChangesAsync();
        return Ok(new WorkOptionsRequest(
            request.Projects.Select((x, i) => x with { Name = projectNames[i] }).ToList(),
            request.Tasks.Select((x, i) => x with { Name = taskNames[i] }).ToList(),
            categories));
    }

    private (Guid OrganisationId, Guid? UserId) CurrentScope()
    {
        if (CurrentUser.Role(User) != "employee") return (CurrentUser.Org(User), null);
        return (CurrentUser.Org(User), CurrentUser.Id(User));
    }
}
