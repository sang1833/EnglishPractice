using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/admin/question-groups")]
[Authorize(Roles = "Admin")]
public class AdminQuestionGroupsController : ControllerBase
{
    private readonly IAdminExamService _adminExamService;

    public AdminQuestionGroupsController(IAdminExamService adminExamService)
    {
        _adminExamService = adminExamService;
    }

    /// <summary>
    /// Create a new question group for a specific section
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateQuestionGroup(
        [FromBody] QuestionGroupCreateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _adminExamService.CreateQuestionGroupAsync(dto, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        // Standard convention returns 201 Created with Location header.
        // For now, returning 201 with the ID. 
        // Ideally we would map to a GET endpoint, e.g. /api/questions/group/{id}.
        return CreatedAtAction("CreateQuestionGroup", new { id = result.Value }, new { id = result.Value });
    }

    /// <summary>
    /// Update an existing question group
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuestionGroup(
        Guid id,
        [FromBody] QuestionGroupUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _adminExamService.UpdateQuestionGroupAsync(id, dto, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return NoContent();
    }
}
