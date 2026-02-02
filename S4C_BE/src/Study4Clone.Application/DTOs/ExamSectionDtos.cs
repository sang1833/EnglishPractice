namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for ExamSection entity
/// </summary>
public record ExamSectionDto(
    Guid Id,
    Guid SkillId,
    string Title,
    int OrderIndex,
    string? TextContent,
    string? AudioUrl,
    string? ImageUrl,
    string? Transcript,
    IEnumerable<QuestionGroupDto> Groups
);

public record ExamSectionListDto(
    Guid Id,
    string Title,
    int OrderIndex,
    bool HasText,
    bool HasAudio,
    int GroupCount
);

public record CreateExamSectionRequest(
    string Title,
    int OrderIndex,
    string? TextContent,
    string? AudioUrl,
    string? ImageUrl,
    string? Transcript
);
