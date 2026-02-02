using System.ComponentModel.DataAnnotations;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

public class ExamImportDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public ExamType Type { get; set; } = ExamType.IeltsAcademic;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public int Duration { get; set; }
    
    public List<ExamSkillImportDto> Skills { get; set; } = new();
}

public class ExamSkillImportDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public SkillType Skill { get; set; }
    public int OrderIndex { get; set; }
    public int Duration { get; set; } // minutes
    
    public List<ExamSectionImportDto> Sections { get; set; } = new();
}

public class ExamSectionImportDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? AudioUrl { get; set; }
    public string? TextContent { get; set; }
    public string? Transcript { get; set; }
    public string? ImageUrl { get; set; }
    
    public List<QuestionGroupImportDto> QuestionGroups { get; set; } = new();
}

public class QuestionGroupImportDto
{
    public string? Title { get; set; } // e.g., "Questions 1-10"
    public string? Instruction { get; set; }
    public QuestionType QuestionType { get; set; }
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
    public string? TextContent { get; set; } // For groups that have their own passage/text
    public string? AudioUrl { get; set; }

    public List<QuestionImportDto> Questions { get; set; } = new();
}

public class QuestionImportDto
{
    public int OrderIndex { get; set; }
    public string? Content { get; set; } // The question text
    public string? Options { get; set; } // JSON string for multiple choice options
    public string? CorrectAnswer { get; set; }
    public double Points { get; set; } = 1.0;
    public string? Explanation { get; set; }
}

public class QuestionGroupCreateDto
{
    [Required]
    public Guid SectionId { get; set; }
    public string? Title { get; set; }
    public string? Instruction { get; set; }
    public QuestionType QuestionType { get; set; }
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
    public string? TextContent { get; set; }
    public string? AudioUrl { get; set; }
}

public class QuestionGroupUpdateDto
{
    public string? Title { get; set; }
    public string? Instruction { get; set; }
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
    public string? TextContent { get; set; }
    public string? AudioUrl { get; set; }
}
