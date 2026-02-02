using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for ExamSkill entity
/// </summary>
public record ExamSkillDto(
    Guid Id,
    Guid ExamId,
    string Title,
    SkillType Skill,
    int OrderIndex,
    int Duration,
    IEnumerable<ExamSectionDto> Sections
);

public record ExamSkillListDto(
    Guid Id,
    string Title,
    SkillType Skill,
    int OrderIndex,
    int Duration,
    int SectionCount
);

public record CreateExamSkillRequest(
    string Title,
    SkillType Skill,
    int OrderIndex,
    int Duration
);
