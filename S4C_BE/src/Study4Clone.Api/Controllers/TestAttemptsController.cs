using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestAttemptsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IScoringService _scoringService;
    private readonly ILogger<TestAttemptsController> _logger;

    public TestAttemptsController(
        IUnitOfWork unitOfWork, 
        IScoringService scoringService,
        ILogger<TestAttemptsController> logger)
    {
        _unitOfWork = unitOfWork;
        _scoringService = scoringService;
        _logger = logger;
    }

    /// <summary>
    /// Get attempts for a specific user
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<PagedList<TestAttemptListDto>>> GetUserAttempts(
        Guid userId,
        [FromQuery] TestAttemptQueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        var result = await _unitOfWork.TestAttempts.GetByUserAsync(
            userId,
            queryParams,
            cancellationToken);

        var items = result.Items.Select(a => new TestAttemptListDto(
            a.Id,
            a.ExamId,
            a.Exam.Title,
            a.StartedAt,
            a.CompletedAt,
            a.Status,
            a.OverallScore,
            a.SelectedSkills,
            string.IsNullOrEmpty(a.SelectedSkills) // IsFullTest
        )).ToList();

        return Ok(new PagedList<TestAttemptListDto>
        {
            Items = items,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        });
    }

    /// <summary>
    /// Get the filtered exam content for a specific attempt (Practice Mode)
    /// </summary>
    [HttpGet("{id:guid}/exam")]
    public async Task<ActionResult<Exam>> GetAttemptExam(Guid id, CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetByIdAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound("Attempt not found");

        var exam = await _unitOfWork.Exams.GetFullExamAsync(attempt.ExamId, cancellationToken);
        if (exam is null)
            return NotFound("Exam content not found");

        if (!string.IsNullOrEmpty(attempt.SelectedSkills))
        {
            var selectedSkills = attempt.SelectedSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
            
            // Filter skills in memory
            exam.Skills = exam.Skills
                .Where(s => selectedSkills.Contains(s.Skill.ToString()))
                .ToList();
        }

        return Ok(exam);
    }

    /// <summary>
    /// Get attempt by ID with all answers
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TestAttemptDto>> GetAttempt(Guid id, CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetWithAnswersAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound();

        return Ok(new TestAttemptDto(
            attempt.Id,
            attempt.UserId,
            attempt.ExamId,
            attempt.Exam.Title,
            attempt.StartedAt,
            attempt.CompletedAt,
            attempt.Status,
            attempt.OverallScore,
            attempt.ListeningScore,
            attempt.ReadingScore,
            attempt.WritingScore,
            attempt.SpeakingScore,
            attempt.TimeRemaining,
            attempt.SelectedSkills
        ));
    }

    /// <summary>
    /// Get detailed test result with scoring breakdown
    /// </summary>
    [HttpGet("{id:guid}/result")]
    public async Task<ActionResult<TestResultDto>> GetTestResult(Guid id, CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetWithAnswersAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound();

        if (attempt.Status != AttemptStatus.Completed)
            return BadRequest("Test has not been submitted yet");

        // Get full exam with questions
        var exam = await _unitOfWork.Exams.GetFullExamAsync(attempt.ExamId, cancellationToken);
        if (exam is null)
            return NotFound("Exam not found");

        var allQuestions = exam.Skills
            .SelectMany(s => s.Sections)
            .SelectMany(sec => sec.Groups)
            .SelectMany(g => g.Questions)
            .ToList();

        var scoringResult = _scoringService.CalculateTestScore(attempt, allQuestions);

        var skillResults = scoringResult.SkillScores.Select(kv => new SkillResultDto(
            kv.Key,
            kv.Key.ToString(),
            kv.Value.CorrectCount,
            kv.Value.TotalQuestions,
            kv.Value.BandScore
        )).ToList();

        var questionResults = scoringResult.QuestionResults.Select((qr, index) =>
        {
            var question = allQuestions.FirstOrDefault(q => q.Id == qr.QuestionId);
            return new QuestionResultDto(
                qr.QuestionId,
                index + 1,
                question?.Content ?? "",
                qr.UserAnswer,
                qr.CorrectAnswer,
                qr.IsCorrect,
                qr.PointsEarned,
                qr.MaxPoints,
                question?.Explanation
            );
        }).ToList();

        return Ok(new TestResultDto(
            attempt.Id,
            attempt.ExamId,
            attempt.Exam.Title,
            scoringResult.OverallBandScore,
            scoringResult.TotalCorrect,
            scoringResult.TotalQuestions,
            scoringResult.PercentageScore,
            attempt.StartedAt,
            attempt.CompletedAt,
            attempt.CompletedAt.HasValue ? attempt.CompletedAt.Value - attempt.StartedAt : TimeSpan.Zero,
            skillResults,
            questionResults
        ));
    }

    /// <summary>
    /// Start a new test attempt
    /// </summary>
    [HttpPost("start")]
    public async Task<ActionResult<TestAttemptDto>> StartTest(
        [FromBody] StartTestRequest request,
        [FromQuery] Guid userId, // In a real app, this would come from auth
        CancellationToken cancellationToken)
    {
        // Check if exam exists - fetch with skills for duration calculation
        var exam = await _unitOfWork.Exams.GetWithSkillsAsync(request.ExamId, cancellationToken);
        if (exam is null)
            return NotFound("Exam not found");

        // Validate Selected Skills if provided
        string? selectedSkillsStr = null;
        int duration = exam.Duration;

        if (request.SelectedSkills != null && request.SelectedSkills.Any())
        {
            var examSkills = exam.Skills.Select(s => s.Skill).ToHashSet();
            if (request.SelectedSkills.Any(s => !examSkills.Contains(s)))
                return BadRequest("One or more selected skills are not available in this exam.");

            // Calculate duration for selected skills
            duration = exam.Skills
                .Where(s => request.SelectedSkills.Contains(s.Skill))
                .Sum(s => s.Duration);

            selectedSkillsStr = string.Join(",", request.SelectedSkills);
        }

        // Check if there's an active attempt
        var activeAttempt = await _unitOfWork.TestAttempts.GetActiveAttemptAsync(
            userId, request.ExamId, cancellationToken);
        if (activeAttempt is not null)
        {
            if (request.ForceNew)
            {
                // Abandon/Delete the old attempt
                await _unitOfWork.TestAttempts.DeleteAsync(activeAttempt, cancellationToken);
                // Continue to create new
            }
            else
            {
                // Resume existing - if Pending, set back to InProgress
                if (activeAttempt.Status == AttemptStatus.Pending)
                {
                    activeAttempt.Status = AttemptStatus.InProgress;
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                }
                
                return Ok(new TestAttemptDto(
                    activeAttempt.Id,
                    activeAttempt.UserId,
                    activeAttempt.ExamId,
                    exam.Title,
                    activeAttempt.StartedAt,
                    activeAttempt.CompletedAt,
                    activeAttempt.Status,
                    activeAttempt.OverallScore, 
                    activeAttempt.ListeningScore, 
                    activeAttempt.ReadingScore, 
                    activeAttempt.WritingScore, 
                    activeAttempt.SpeakingScore,
                    activeAttempt.TimeRemaining,
                    activeAttempt.SelectedSkills
                ));
            }
        }

        var attempt = new TestAttempt
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ExamId = request.ExamId,
            StartedAt = DateTime.UtcNow,
            Status = AttemptStatus.InProgress,
            SelectedSkills = selectedSkillsStr,
            TimeRemaining = duration * 60 // Convert minutes to seconds
        };

        await _unitOfWork.TestAttempts.AddAsync(attempt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} started attempt {AttemptId} for exam {ExamId} (Skills: {Skills})",
            userId, attempt.Id, request.ExamId, selectedSkillsStr ?? "All");

        return CreatedAtAction(nameof(GetAttempt), new { id = attempt.Id }, new TestAttemptDto(
            attempt.Id,
            attempt.UserId,
            attempt.ExamId,
            exam.Title,
            attempt.StartedAt,
            attempt.CompletedAt,
            attempt.Status,
            null, null, null, null, null, 
            attempt.TimeRemaining,
            attempt.SelectedSkills
        ));
    }

    /// <summary>
    /// Submit test answers and get scored result
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<TestResultDto>> SubmitTest(
        Guid id,
        [FromBody] SubmitTestRequest request,
        CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetWithAnswersAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound();

        if (attempt.Status != AttemptStatus.InProgress)
            return BadRequest("This attempt is no longer active");

        // Add answers
        foreach (var answer in request.Answers)
        {
            await _unitOfWork.UserAnswers.AddAsync(new UserAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = id,
                QuestionId = answer.QuestionId,
                TextContent = answer.TextContent,
                SelectedOptions = answer.SelectedOptions != null 
                    ? string.Join(",", answer.SelectedOptions) 
                    : null
            }, cancellationToken);
        }

        attempt.Status = AttemptStatus.Completed;
        attempt.CompletedAt = DateTime.UtcNow;

        // Get exam with all questions for scoring
        var exam = await _unitOfWork.Exams.GetFullExamAsync(attempt.ExamId, cancellationToken);
        if (exam is null)
            return NotFound("Exam not found");

        var allQuestions = exam.Skills
            .SelectMany(s => s.Sections)
            .SelectMany(sec => sec.Groups)
            .SelectMany(g => g.Questions)
            .ToList();

        // Calculate scores
        var scoringResult = _scoringService.CalculateTestScore(attempt, allQuestions);

        // Update attempt with scores
        attempt.OverallScore = scoringResult.OverallBandScore;
        if (scoringResult.SkillScores.TryGetValue(SkillType.Listening, out var listening))
            attempt.ListeningScore = listening.BandScore;
        if (scoringResult.SkillScores.TryGetValue(SkillType.Reading, out var reading))
            attempt.ReadingScore = reading.BandScore;
        if (scoringResult.SkillScores.TryGetValue(SkillType.Writing, out var writing))
            attempt.WritingScore = writing.BandScore;
        if (scoringResult.SkillScores.TryGetValue(SkillType.Speaking, out var speaking))
            attempt.SpeakingScore = speaking.BandScore;

        // Save Statistics for Dashboard
        attempt.CorrectQuestionCount = scoringResult.TotalCorrect;
        attempt.TotalQuestionCount = scoringResult.TotalQuestions;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Attempt {AttemptId} submitted. Score: {Score}/9.0 ({Correct}/{Total} correct)",
            id, scoringResult.OverallBandScore, scoringResult.TotalCorrect, scoringResult.TotalQuestions);

        // Build result DTO
        var skillResults = scoringResult.SkillScores.Select(kv => new SkillResultDto(
            kv.Key,
            kv.Key.ToString(),
            kv.Value.CorrectCount,
            kv.Value.TotalQuestions,
            kv.Value.BandScore
        )).ToList();

        var questionResults = scoringResult.QuestionResults.Select((qr, index) =>
        {
            var question = allQuestions.FirstOrDefault(q => q.Id == qr.QuestionId);
            return new QuestionResultDto(
                qr.QuestionId,
                index + 1,
                question?.Content ?? "",
                qr.UserAnswer,
                qr.CorrectAnswer,
                qr.IsCorrect,
                qr.PointsEarned,
                qr.MaxPoints,
                question?.Explanation
            );
        }).ToList();

        return Ok(new TestResultDto(
            attempt.Id,
            attempt.ExamId,
            exam.Title,
            scoringResult.OverallBandScore,
            scoringResult.TotalCorrect,
            scoringResult.TotalQuestions,
            scoringResult.PercentageScore,
            attempt.StartedAt,
            attempt.CompletedAt,
            attempt.CompletedAt.Value - attempt.StartedAt,
            skillResults,
            questionResults
        ));
    }

    /// <summary>
    /// Abandon a test attempt
    /// </summary>
    [HttpPost("{id:guid}/abandon")]
    public async Task<IActionResult> AbandonTest(Guid id, CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetByIdAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound();

        if (attempt.Status != AttemptStatus.InProgress)
            return BadRequest("This attempt is no longer active");

        attempt.Status = AttemptStatus.Abandoned;
        attempt.CompletedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Pause test and save draft
    /// </summary>
    [HttpPost("{id:guid}/pause")]
    public async Task<IActionResult> PauseTest(
        Guid id,
        [FromBody] PauseTestRequest request,
        CancellationToken cancellationToken)
    {
        var attempt = await _unitOfWork.TestAttempts.GetWithAnswersAsync(id, cancellationToken);
        if (attempt is null)
            return NotFound();

        if (attempt.Status != AttemptStatus.InProgress)
            return BadRequest("Only in-progress tests can be paused");

        // Clear existing answers to avoid duplicates/stale data
        // We need to fetch and delete them. GetWithAnswersAsync includes them in attempt.Answers
        foreach (var existingAnswer in attempt.Answers.ToList()) 
        {
            await _unitOfWork.UserAnswers.DeleteAsync(existingAnswer, cancellationToken);
        }

        // Add new answers from draft
        foreach (var answer in request.Answers)
        {
            await _unitOfWork.UserAnswers.AddAsync(new UserAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = id,
                QuestionId = answer.QuestionId,
                TextContent = answer.TextContent,
                SelectedOptions = answer.SelectedOptions != null 
                    ? string.Join(",", answer.SelectedOptions) 
                    : null
            }, cancellationToken);
        }

        attempt.Status = AttemptStatus.Pending;
        attempt.TimeRemaining = request.TimeRemaining;
        
        // Ensure CompletedAt is null as it's just paused
        attempt.CompletedAt = null;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok();
    }
}
