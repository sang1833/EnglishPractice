using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for QuestionGroup entity
/// </summary>
public record QuestionGroupDto(
    Guid Id,
    Guid SectionId,
    string? Title,
    string? Instruction,
    QuestionType QuestionType,
    int OrderIndex,
    IEnumerable<QuestionDto> Questions
);

public record QuestionGroupListDto(
    Guid Id,
    string? Title,
    QuestionType QuestionType,
    int OrderIndex,
    int QuestionCount
);

public record CreateQuestionGroupRequest(
    string? Title,
    string? Instruction,
    QuestionType QuestionType,
    int OrderIndex
);
