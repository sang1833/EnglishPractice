using Study4Clone.Domain.Enums;

namespace Study4Clone.Domain.Entities;

public class QuestionGroup
{
    public Guid Id { get; set; }
    public Guid SectionId { get; set; }
    public string? Title { get; set; }
    public string? Instruction { get; set; }
    public QuestionType QuestionType { get; set; }
    public int OrderIndex { get; set; }

    // Content properties
    public string? ImageUrl { get; set; }
    public string? TextContent { get; set; }
    public string? AudioUrl { get; set; }

    // Navigation properties
    public virtual ExamSection Section { get; set; } = null!;
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
}
