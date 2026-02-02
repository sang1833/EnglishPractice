using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/admin/exams")]
[Authorize(Roles = "Admin")]
public class AdminExamsController : ControllerBase
{
    private readonly IAdminExamService _adminExamService;

    public AdminExamsController(IAdminExamService adminExamService)
    {
        _adminExamService = adminExamService;
    }

    /// <summary>
    /// Import a full exam from JSON
    /// </summary>
    [HttpPost("import")]
    public async Task<IActionResult> ImportExam(
        [FromBody] ExamImportDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _adminExamService.ImportExamAsync(dto, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return CreatedAtAction("GetExam", "Exams", new { id = result.Value }, new { id = result.Value });
    }
}
