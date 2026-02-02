using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Interfaces;

/// <summary>
/// Service for scoring test attempts and calculating IELTS band scores
/// </summary>
public interface IScoringService
{
    /// <summary>
    /// Score a single answer against the correct answer
    /// </summary>
    /// <param name="userAnswer">The user's submitted answer</param>
    /// <param name="correctAnswer">The correct answer</param>
    /// <param name="questionType">Type of question for scoring rules</param>
    /// <returns>True if answer is correct</returns>
    bool ScoreAnswer(string? userAnswer, string correctAnswer, QuestionType questionType);

    /// <summary>
    /// Calculate the score for a complete test attempt
    /// </summary>
    /// <param name="attempt">The test attempt with user answers</param>
    /// <param name="questions">All questions in the exam</param>
    /// <returns>Scoring result with details</returns>
    TestScoringResult CalculateTestScore(TestAttempt attempt, IEnumerable<Question> questions);

    /// <summary>
    /// Convert raw score to IELTS band score (0-9.0)
    /// </summary>
    /// <param name="correctCount">Number of correct answers</param>
    /// <param name="totalQuestions">Total number of questions</param>
    /// <param name="skillType">The skill type (Listening/Reading have different scales)</param>
    /// <returns>IELTS band score</returns>
    double CalculateBandScore(int correctCount, int totalQuestions, SkillType skillType);
}

/// <summary>
/// Result of scoring a test attempt
/// </summary>
public class TestScoringResult
{
    public double OverallBandScore { get; set; }
    public int TotalCorrect { get; set; }
    public int TotalQuestions { get; set; }
    public double PercentageScore { get; set; }
    public Dictionary<SkillType, SkillScore> SkillScores { get; set; } = new();
    public List<QuestionResult> QuestionResults { get; set; } = new();
}

/// <summary>
/// Score for a specific skill
/// </summary>
public class SkillScore
{
    public SkillType Skill { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public double BandScore { get; set; }
}

/// <summary>
/// Result for a single question
/// </summary>
public class QuestionResult
{
    public Guid QuestionId { get; set; }
    public string? UserAnswer { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public double PointsEarned { get; set; }
    public double MaxPoints { get; set; }
}
