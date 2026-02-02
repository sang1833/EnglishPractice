namespace Study4Clone.Domain.Entities;

public class Question
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public int OrderIndex { get; set; } // Global question number (1 to 40)
    public string? Content { get; set; } // Question stem

    // JSON Fields for flexibility - stored as string (serialized JSON)
    public string? Options { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;

    public string? Explanation { get; set; }
    public double Points { get; set; } = 1.0;

    // Navigation properties
    public virtual QuestionGroup Group { get; set; } = null!;
    public virtual ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
}
