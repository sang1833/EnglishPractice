using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for Exam and related entities
/// </summary>
public record ExamDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? ThumbnailUrl,
    ExamType Type,
    ExamStatus Status,
    int Duration,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ExamListDto(
    Guid Id,
    string Title,
    string Slug,
    string? ThumbnailUrl,
    ExamType Type,
    ExamStatus Status,
    int Duration,
    List<string> AvailableSkills,
    string? TargetSkill = null // The specific skill this card represents (Modular view)
);

public record CreateExamRequest(
    string Title,
    string? Description,
    string? ThumbnailUrl,
    ExamType Type = ExamType.IeltsAcademic,
    int Duration = 180
);

public record UpdateExamRequest(
    string? Title,
    string? Description,
    string? ThumbnailUrl,
    ExamType? Type,
    ExamStatus? Status,
    int? Duration
);
