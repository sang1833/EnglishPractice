namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for Question entity
/// </summary>
public record QuestionDto(
    Guid Id,
    Guid GroupId,
    int OrderIndex,
    string? Content,
    string? Options,        // JSON string
    string CorrectAnswer,   // JSON string
    string? Explanation,
    double Points
);

public record QuestionListDto(
    Guid Id,
    int OrderIndex,
    string? Content,
    double Points
);

public record CreateQuestionRequest(
    int OrderIndex,
    string? Content,
    string? Options,        // JSON string
    string CorrectAnswer,   // JSON string
    string? Explanation,
    double Points = 1.0
);

public record UpdateQuestionRequest(
    int? OrderIndex,
    string? Content,
    string? Options,
    string? CorrectAnswer,
    string? Explanation,
    double? Points
);
