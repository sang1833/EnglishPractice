using Study4Clone.Domain.Enums;

namespace Study4Clone.Domain.Entities;

public class Exam
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public ExamType Type { get; set; } = ExamType.IeltsAcademic;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public int Duration { get; set; } // Total duration in minutes
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<ExamSkill> Skills { get; set; } = new List<ExamSkill>();
    public virtual ICollection<TestAttempt> Attempts { get; set; } = new List<TestAttempt>();
}
