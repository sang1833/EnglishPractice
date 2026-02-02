namespace Study4Clone.Domain.Entities;

public class UserAnswer
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public Guid QuestionId { get; set; }

    // User's input
    public string? AudioUrl { get; set; }       // For speaking
    public string? TextContent { get; set; }    // For writing or blank filling
    public string? SelectedOptions { get; set; } // JSON for MCQ (e.g. ["A"])

    public bool? IsCorrect { get; set; } // Null if not graded yet
    public double? ScoreEarned { get; set; }
    public string? Feedback { get; set; } // Teacher's feedback

    // Navigation properties
    public virtual TestAttempt Attempt { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
}
