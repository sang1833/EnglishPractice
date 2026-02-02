using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Interfaces;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SkillsController> _logger;

    public SkillsController(IUnitOfWork unitOfWork, ILogger<SkillsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get all skills for an exam
    /// </summary>
    [HttpGet("exam/{examId:guid}")]
    public async Task<ActionResult<IEnumerable<ExamSkillListDto>>> GetSkillsByExam(
        Guid examId, 
        CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetWithSkillsAsync(examId, cancellationToken);
        if (exam is null)
            return NotFound("Exam not found");

        var skills = exam.Skills.Select(s => new ExamSkillListDto(
            s.Id, s.Title, s.Skill, s.OrderIndex, s.Duration, s.Sections?.Count ?? 0
        )).OrderBy(s => s.OrderIndex).ToList();

        return Ok(skills);
    }

    /// <summary>
    /// Get skill by ID with sections
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExamSkillDto>> GetSkill(Guid id, CancellationToken cancellationToken)
    {
        var skill = await _unitOfWork.Exams.GetByIdAsync(id, cancellationToken);
        // For simplicity, we'll need to add a method to get skill by ID
        // This is a placeholder that returns the skill without full relationship
        return NotFound("Use /api/exams/{examId}/full for complete skill data");
    }

    /// <summary>
    /// Create a new skill for an exam
    /// </summary>
    [HttpPost("exam/{examId:guid}")]
    public async Task<ActionResult<ExamSkillListDto>> CreateSkill(
        Guid examId,
        [FromBody] CreateExamSkillRequest request,
        CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetByIdAsync(examId, cancellationToken);
        if (exam is null)
            return NotFound("Exam not found");

        var skill = new ExamSkill
        {
            Id = Guid.NewGuid(),
            ExamId = examId,
            Title = request.Title,
            Skill = request.Skill,
            OrderIndex = request.OrderIndex,
            Duration = request.Duration
        };

        // Need to add skill repository - for now use exam's navigation
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created skill {SkillId} for exam {ExamId}", skill.Id, examId);

        return CreatedAtAction(nameof(GetSkillsByExam), new { examId }, new ExamSkillListDto(
            skill.Id, skill.Title, skill.Skill, skill.OrderIndex, skill.Duration, 0
        ));
    }
}
