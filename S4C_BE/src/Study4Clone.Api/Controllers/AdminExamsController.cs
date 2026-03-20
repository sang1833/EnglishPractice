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

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminExamEditorDto>> GetExamEditor(Guid id, CancellationToken cancellationToken)
    {
        var result = await _adminExamService.GetExamEditorAsync(id, cancellationToken);
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error });
        }

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<AdminExamEditorDto>> CreateExam(
        [FromBody] AdminExamEditorDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _adminExamService.CreateExamAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return CreatedAtAction(nameof(GetExamEditor), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AdminExamEditorDto>> UpdateExam(
        Guid id,
        [FromBody] AdminExamEditorDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _adminExamService.UpdateExamAsync(id, dto, cancellationToken);
        if (!result.IsSuccess)
        {
            if (result.Error?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
            {
                return NotFound(new { error = result.Error });
            }

            return BadRequest(new { error = result.Error });
        }

        return Ok(result.Value);
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
