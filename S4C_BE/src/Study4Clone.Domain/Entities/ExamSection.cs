namespace Study4Clone.Domain.Entities;

public class ExamSection
{
    public Guid Id { get; set; }
    public Guid SkillId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Resource Content
    public string? TextContent { get; set; } // HTML content for Reading Passage
    public string? AudioUrl { get; set; }    // URL for Listening Audio
    public string? ImageUrl { get; set; }    // Chart/Graph for Writing Task 1
    public string? Transcript { get; set; }  // Audio transcript for Listening

    // Navigation properties
    public virtual ExamSkill Skill { get; set; } = null!;
    public virtual ICollection<QuestionGroup> Groups { get; set; } = new List<QuestionGroup>();
}
