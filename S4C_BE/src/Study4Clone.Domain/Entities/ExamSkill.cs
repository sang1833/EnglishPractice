using Study4Clone.Domain.Enums;

namespace Study4Clone.Domain.Entities;

public class ExamSkill
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string Title { get; set; } = string.Empty;
    public SkillType Skill { get; set; }
    public int OrderIndex { get; set; }
    public int Duration { get; set; } // Time limit in minutes

    // Navigation properties
    public virtual Exam Exam { get; set; } = null!;
    public virtual ICollection<ExamSection> Sections { get; set; } = new List<ExamSection>();
}
