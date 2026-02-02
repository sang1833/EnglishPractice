using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// Detailed test result after submission
/// </summary>
public record TestResultDto(
    Guid AttemptId,
    Guid ExamId,
    string ExamTitle,
    double OverallBandScore,
    int TotalCorrect,
    int TotalQuestions,
    double PercentageScore,
    DateTime StartedAt,
    DateTime? CompletedAt,
    TimeSpan TimeTaken,
    IEnumerable<SkillResultDto> SkillResults,
    IEnumerable<QuestionResultDto> QuestionResults
);

/// <summary>
/// Score breakdown by skill
/// </summary>
public record SkillResultDto(
    SkillType Skill,
    string SkillName,
    int CorrectCount,
    int TotalQuestions,
    double BandScore
);

/// <summary>
/// Individual question result
/// </summary>
public record QuestionResultDto(
    Guid QuestionId,
    int QuestionNumber,
    string QuestionContent,
    string? UserAnswer,
    string CorrectAnswer,
    bool IsCorrect,
    double PointsEarned,
    double MaxPoints,
    string? Explanation
);
