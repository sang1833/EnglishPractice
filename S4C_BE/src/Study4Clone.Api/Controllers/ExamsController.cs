using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExamsController> _logger;

    public ExamsController(IUnitOfWork unitOfWork, ILogger<ExamsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of exams
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedList<ExamListDto>>> GetExams(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] ExamStatus? status = null,
        [FromQuery] ExamType? type = null,
        [FromQuery] SkillType? skill = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _unitOfWork.Exams.GetPagedAsync(
            new PaginationParams(page, pageSize),
            status,
            type,
            skill,
            search,
            cancellationToken);

        var items = result.Items.SelectMany(e => 
        {
            var availableSkills = e.Skills.Select(s => s.Skill.ToString()).Distinct().ToList();
            
            // If exam has no specific skills (unlikely for IELTS) or strictly "Full Test" logic required,
            // we could return just the exam. But user requirement is "Explode".
            // If no skills are defined, return as "Unknown" or fallback to title? 
            // Assuming for IELTS db we always have skills.
            // If explicit skill filter was requested, 'availableSkills' will contain it.
            // But we should likely return "Full Test" AND/OR "Modular" or just "Modular".
            // User request: "displayed separate individual skills... Cambridge 18 Reading...".
            
            if (!availableSkills.Any())
            {
                 return new List<ExamListDto> 
                 { 
                     new ExamListDto(e.Id, e.Title, e.Slug, e.ThumbnailUrl, e.Type, e.Status, e.Duration, availableSkills, null) 
                 };
            }

            return availableSkills.Select(skillName => new ExamListDto(
                e.Id,
                $"{e.Title} {skillName}", // Append Skill to Title
                e.Slug,
                e.ThumbnailUrl,
                e.Type,
                e.Status,
                e.Skills.FirstOrDefault(s => s.Skill.ToString() == skillName)?.Duration ?? e.Duration / 4, // Approx duration or specific
                new List<string> { skillName }, // Available for this "card" is just this skill
                skillName // TargetSkill
            ));
        }).ToList();

        return Ok(new PagedList<ExamListDto>
        {
            Items = items,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        });
    }

    /// <summary>
    /// Get exam by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExamDto>> GetExam(Guid id, CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetByIdAsync(id, cancellationToken);
        if (exam is null)
            return NotFound();

        return Ok(new ExamDto(
            exam.Id,
            exam.Title,
            exam.Slug,
            exam.Description,
            exam.ThumbnailUrl,
            exam.Type,
            exam.Status,
            exam.Duration,
            exam.CreatedAt,
            exam.UpdatedAt
        ));
    }

    /// <summary>
    /// Get full exam with all skills, sections, and questions
    /// </summary>
    [HttpGet("{id:guid}/full")]
    public async Task<ActionResult<Exam>> GetFullExam(Guid id, CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetFullExamAsync(id, cancellationToken);
        if (exam is null)
            return NotFound();

        return Ok(exam);
    }

    /// <summary>
    /// Get exam by slug
    /// </summary>
    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<ExamDto>> GetExamBySlug(string slug, CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetBySlugAsync(slug, cancellationToken);
        if (exam is null)
            return NotFound();

        return Ok(new ExamDto(
            exam.Id,
            exam.Title,
            exam.Slug,
            exam.Description,
            exam.ThumbnailUrl,
            exam.Type,
            exam.Status,
            exam.Duration,
            exam.CreatedAt,
            exam.UpdatedAt
        ));
    }

    /// <summary>
    /// Create a new exam
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ExamDto>> CreateExam(CreateExamRequest request, CancellationToken cancellationToken)
    {
        var slug = GenerateSlug(request.Title);
        
        // Check if slug exists
        var existing = await _unitOfWork.Exams.GetBySlugAsync(slug, cancellationToken);
        if (existing is not null)
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Slug = slug,
            Description = request.Description,
            ThumbnailUrl = request.ThumbnailUrl,
            Type = request.Type,
            Status = ExamStatus.Draft,
            Duration = request.Duration,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Exams.AddAsync(exam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created exam {ExamId} with title {Title}", exam.Id, exam.Title);

        return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, new ExamDto(
            exam.Id,
            exam.Title,
            exam.Slug,
            exam.Description,
            exam.ThumbnailUrl,
            exam.Type,
            exam.Status,
            exam.Duration,
            exam.CreatedAt,
            exam.UpdatedAt
        ));
    }

    /// <summary>
    /// Update an exam
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExamDto>> UpdateExam(Guid id, UpdateExamRequest request, CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetByIdAsync(id, cancellationToken);
        if (exam is null)
            return NotFound();

        if (request.Title is not null)
            exam.Title = request.Title;
        if (request.Description is not null)
            exam.Description = request.Description;
        if (request.ThumbnailUrl is not null)
            exam.ThumbnailUrl = request.ThumbnailUrl;
        if (request.Type.HasValue)
            exam.Type = request.Type.Value;
        if (request.Status.HasValue)
            exam.Status = request.Status.Value;
        if (request.Duration.HasValue)
            exam.Duration = request.Duration.Value;

        exam.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Exams.UpdateAsync(exam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new ExamDto(
            exam.Id,
            exam.Title,
            exam.Slug,
            exam.Description,
            exam.ThumbnailUrl,
            exam.Type,
            exam.Status,
            exam.Duration,
            exam.CreatedAt,
            exam.UpdatedAt
        ));
    }

    /// <summary>
    /// Delete an exam
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExam(Guid id, CancellationToken cancellationToken)
    {
        var exam = await _unitOfWork.Exams.GetByIdAsync(id, cancellationToken);
        if (exam is null)
            return NotFound();

        await _unitOfWork.Exams.DeleteAsync(exam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static string GenerateSlug(string title)
    {
        return title.ToLower()
            .Replace(" ", "-")
            .Replace("--", "-")
            .Trim('-');
    }
}
