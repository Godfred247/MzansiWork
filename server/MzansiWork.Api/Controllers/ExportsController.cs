using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiWork.Api.Data;
using MzansiWork.Api.Domain;
using MzansiWork.Api.Security;

namespace MzansiWork.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/exports")]
public class ExportsController(AppDbContext db) : ControllerBase
{
    public record ExportRequest(string Report, string Format, string Range, string DataType);

    [HttpGet]
    public async Task<IActionResult> List()
    {
        if (CurrentUser.Role(User) == "employee") return Forbid();
        var exports = await db.Exports.Where(x => x.OrganisationId == CurrentUser.Org(User)).ToListAsync();
        return Ok(exports.OrderByDescending(x => x.CreatedAt));
    }

    [HttpPost]
    public async Task<IActionResult> Create(ExportRequest request)
    {
        if (CurrentUser.Role(User) is not ("owner" or "manager")) return Forbid();
        var orgId = CurrentUser.Org(User);
        var corrections = await db.Corrections.Where(x => x.OrganisationId == orgId).ToListAsync();
        var header = "Employee,Original,Requested,Status";
        var lines = corrections.Select(c => string.Join(',', Csv(c.UserId.ToString()[..8]), Csv(c.Original), Csv(c.Requested), Csv(c.Status)));
        var csv = $"# {request.Report}\r\n# Data type: {request.DataType}\r\n# Range: {request.Range}\r\n{header}\r\n{string.Join("\r\n", lines)}";
        var record = new ExportRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = orgId,
            Report = request.Report,
            Format = request.Format,
            Range = request.Range,
            DataType = request.DataType,
            Status = "done",
            Rows = corrections.Count,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.Exports.Add(record);
        db.Audit.Add(new AuditRecord
        {
            Id = Guid.NewGuid(),
            OrganisationId = orgId,
            Actor = CurrentUser.Name(User),
            Action = "Exported report",
            Target = $"{request.Report} · {request.Format} · {request.DataType}",
            Category = "export",
            At = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        var file = request.Format.Equals("PDF", StringComparison.OrdinalIgnoreCase) ? "report.pdf" : request.Format.Equals("Excel", StringComparison.OrdinalIgnoreCase) ? "report.xls" : "report.csv";
        var type = file.EndsWith(".pdf") ? "application/pdf" : file.EndsWith(".xls") ? "application/vnd.ms-excel" : "text/csv";
        if (file.EndsWith(".pdf")) bytes = Encoding.ASCII.GetBytes(SimplePdf(request.Report, request.DataType, csv));
        return File(bytes, type, file);
    }

    private static string Csv(string value) => value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;

    private static string SimplePdf(string title, string dataType, string body)
    {
        var text = $"{title} ({dataType})\\n{body.Replace("(", "[").Replace(")", "]").Replace("\r", "").Replace("\n", " ")}";
        if (text.Length > 800) text = text[..800];
        var stream = $"BT /F1 10 Tf 40 800 Td ({text}) Tj ET";
        return "%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n" +
               $"4 0 obj<< /Length {stream.Length} >>stream\n{stream}\nendstream\nendobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\ntrailer<< /Root 1 0 R >>\n%%EOF";
    }
}
