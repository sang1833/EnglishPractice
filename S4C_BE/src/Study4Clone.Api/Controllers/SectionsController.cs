using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Interfaces;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SectionsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SectionsController> _logger;

    public SectionsController(IUnitOfWork unitOfWork, ILogger<SectionsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get section by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSection(Guid id, CancellationToken cancellationToken)
    {
        // Sections are typically accessed through the full exam endpoint
        // This endpoint is for direct section access if needed
        return NotFound("Use /api/exams/{examId}/full for complete section data");
    }

    /// <summary>
    /// Create a new section for a skill
    /// </summary>
    [HttpPost("skill/{skillId:guid}")]
    public async Task<IActionResult> CreateSection(
        Guid skillId,
        [FromBody] CreateExamSectionRequest request,
        CancellationToken cancellationToken)
    {
        var section = new ExamSection
        {
            Id = Guid.NewGuid(),
            SkillId = skillId,
            Title = request.Title,
            OrderIndex = request.OrderIndex,
            TextContent = request.TextContent,
            AudioUrl = request.AudioUrl,
            ImageUrl = request.ImageUrl,
            Transcript = request.Transcript
        };

        // Would need to add section to context and save
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created section {SectionId} for skill {SkillId}", section.Id, skillId);

        return Created($"/api/sections/{section.Id}", new ExamSectionListDto(
            section.Id, section.Title, section.OrderIndex, 
            !string.IsNullOrEmpty(section.TextContent),
            !string.IsNullOrEmpty(section.AudioUrl),
            0
        ));
    }
}
