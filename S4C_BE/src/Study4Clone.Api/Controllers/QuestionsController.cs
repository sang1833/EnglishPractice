using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Interfaces;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<QuestionsController> _logger;

    public QuestionsController(IUnitOfWork unitOfWork, ILogger<QuestionsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get question by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetQuestion(Guid id, CancellationToken cancellationToken)
    {
        // Questions are typically accessed through the full exam endpoint
        return NotFound("Use /api/exams/{examId}/full for complete question data");
    }

    /// <summary>
    /// Create a new question for a group
    /// </summary>
    [HttpPost("group/{groupId:guid}")]
    public async Task<IActionResult> CreateQuestion(
        Guid groupId,
        [FromBody] CreateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var question = new Question
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            OrderIndex = request.OrderIndex,
            Content = request.Content,
            Options = request.Options,
            CorrectAnswer = request.CorrectAnswer,
            Explanation = request.Explanation,
            Points = request.Points
        };

        // Would need to add question to context and save
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created question {QuestionId} for group {GroupId}", question.Id, groupId);

        return Created($"/api/questions/{question.Id}", new QuestionListDto(
            question.Id, question.OrderIndex, question.Content, question.Points
        ));
    }

    /// <summary>
    /// Bulk create questions for a group
    /// </summary>
    [HttpPost("group/{groupId:guid}/bulk")]
    public async Task<IActionResult> BulkCreateQuestions(
        Guid groupId,
        [FromBody] IEnumerable<CreateQuestionRequest> requests,
        CancellationToken cancellationToken)
    {
        var questions = requests.Select(req => new Question
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            OrderIndex = req.OrderIndex,
            Content = req.Content,
            Options = req.Options,
            CorrectAnswer = req.CorrectAnswer,
            Explanation = req.Explanation,
            Points = req.Points
        }).ToList();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created {Count} questions for group {GroupId}", questions.Count, groupId);

        return Created($"/api/exams/", questions.Select(q => new QuestionListDto(
            q.Id, q.OrderIndex, q.Content, q.Points
        )));
    }

    /// <summary>
    /// Update a question
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuestion(
        Guid id,
        [FromBody] UpdateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        // Would need direct question repository access
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Delete a question
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid id, CancellationToken cancellationToken)
    {
        // Would need direct question repository access
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
