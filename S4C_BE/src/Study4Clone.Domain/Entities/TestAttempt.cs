using Study4Clone.Domain.Enums;

namespace Study4Clone.Domain.Entities;

public class TestAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ExamId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    
    public int? TimeRemaining { get; set; }
    
    // Comma-separated list of selected skills (e.g., "Listening,Reading")
    // Null or Empty implies Full Test
    public string? SelectedSkills { get; set; }

    // Scores
    public double? OverallScore { get; set; }
    public double? ListeningScore { get; set; }
    public double? ReadingScore { get; set; }
    public double? WritingScore { get; set; }
    public double? SpeakingScore { get; set; }

    // Statistics Cache (For Dashboard)
    public int CorrectQuestionCount { get; set; }
    public int TotalQuestionCount { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Exam Exam { get; set; } = null!;
    public virtual ICollection<UserAnswer> Answers { get; set; } = new List<UserAnswer>();
}
