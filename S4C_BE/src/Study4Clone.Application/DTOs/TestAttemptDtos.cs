using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for TestAttempt entity
/// </summary>
public record TestAttemptDto(
    Guid Id,
    Guid UserId,
    Guid ExamId,
    string ExamTitle,
    DateTime StartedAt,
    DateTime? CompletedAt,
    AttemptStatus Status,
    double? OverallScore,
    double? ListeningScore,
    double? ReadingScore,
    double? WritingScore,
    double? SpeakingScore,
    int? TimeRemaining,
    string? SelectedSkills
);

public record TestAttemptListDto(
    Guid Id,
    Guid ExamId,
    string ExamTitle,
    DateTime StartedAt,
    DateTime? CompletedAt,
    AttemptStatus Status,
    double? OverallScore,
    string? SelectedSkills,
    bool IsFullTest
);

public record StartTestRequest(
    Guid ExamId,
    bool ForceNew = false,
    List<SkillType>? SelectedSkills = null // If null/empty -> Full Test
);

public record SubmitTestRequest(
    IEnumerable<SubmitAnswerRequest> Answers
);

public record SubmitAnswerRequest(
    Guid QuestionId,
    string? TextContent,
    string? SelectedOptions,  // JSON string
    string? AudioUrl
);

public record PauseTestRequest(
    IEnumerable<SubmitAnswerRequest> Answers,
    int? TimeRemaining
);
