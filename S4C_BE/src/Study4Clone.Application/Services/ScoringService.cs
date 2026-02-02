using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Services;

/// <summary>
/// Implementation of scoring logic for IELTS tests
/// </summary>
public class ScoringService : IScoringService
{
    /// <inheritdoc />
    public bool ScoreAnswer(string? userAnswer, string correctAnswer, QuestionType questionType)
    {
        if (string.IsNullOrWhiteSpace(userAnswer))
            return false;

        return questionType switch
        {
            // Exact match for multiple choice (A, B, C, D) and True/False/Not Given
            QuestionType.MultipleChoice or
            QuestionType.TrueFalseNotGiven => 
                string.Equals(userAnswer.Trim(), correctAnswer.Trim(), StringComparison.OrdinalIgnoreCase),

            // Fill in the blank - case insensitive, trim whitespace
            QuestionType.FillInTheBlank => 
                NormalizeFillInBlankAnswer(userAnswer).Equals(
                    NormalizeFillInBlankAnswer(correctAnswer), 
                    StringComparison.OrdinalIgnoreCase),

            // Matching headings - exact match
            QuestionType.MatchingHeadings or
            QuestionType.DropDown =>
                string.Equals(userAnswer.Trim(), correctAnswer.Trim(), StringComparison.OrdinalIgnoreCase),

            // Essay and Speaking require manual grading - always return false for auto-scoring
            QuestionType.Essay or
            QuestionType.SpeakingRecording => false,

            _ => false
        };
    }

    /// <inheritdoc />
    public TestScoringResult CalculateTestScore(TestAttempt attempt, IEnumerable<Question> questions)
    {
        var result = new TestScoringResult();
        var questionsList = questions.ToList();
        var answersDict = attempt.Answers.ToDictionary(a => a.QuestionId);

        // Group questions by skill for component scoring
        var questionsBySkill = new Dictionary<SkillType, List<(Question, UserAnswer?)>>();
        
        // Parse selected skills for Practice Mode
        HashSet<string>? selectedSkills = null;
        if (!string.IsNullOrEmpty(attempt.SelectedSkills))
        {
            selectedSkills = attempt.SelectedSkills
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        foreach (var question in questionsList)
        {
            var skillType = question.Group?.Section?.Skill?.Skill ?? SkillType.Reading;
            
            // Skip skills not selected in Practice Mode
            if (selectedSkills != null && !selectedSkills.Contains(skillType.ToString()))
                continue;
            
            if (!questionsBySkill.ContainsKey(skillType))
                questionsBySkill[skillType] = new List<(Question, UserAnswer?)>();

            answersDict.TryGetValue(question.Id, out var userAnswer);
            questionsBySkill[skillType].Add((question, userAnswer));
        }

        // Score each question
        foreach (var question in questionsList)
        {
            answersDict.TryGetValue(question.Id, out var userAnswer);
            
            var isCorrect = ScoreAnswer(
                GetAnswerText(userAnswer), 
                question.CorrectAnswer ?? string.Empty, 
                question.Group?.QuestionType ?? QuestionType.MultipleChoice);

            var questionResult = new QuestionResult
            {
                QuestionId = question.Id,
                UserAnswer = GetAnswerText(userAnswer),
                CorrectAnswer = question.CorrectAnswer ?? string.Empty,
                IsCorrect = isCorrect,
                MaxPoints = question.Points,
                PointsEarned = isCorrect ? question.Points : 0
            };

            result.QuestionResults.Add(questionResult);

            if (isCorrect)
                result.TotalCorrect++;
        }

        result.TotalQuestions = questionsList.Count;
        result.PercentageScore = result.TotalQuestions > 0 
            ? (double)result.TotalCorrect / result.TotalQuestions * 100 
            : 0;

        // Calculate skill-level scores
        foreach (var (skillType, skillQuestions) in questionsBySkill)
        {
            var correctInSkill = skillQuestions.Count(sq => 
                ScoreAnswer(
                    GetAnswerText(sq.Item2), 
                    sq.Item1.CorrectAnswer ?? string.Empty,
                    sq.Item1.Group?.QuestionType ?? QuestionType.MultipleChoice));

            var skillScore = new SkillScore
            {
                Skill = skillType,
                CorrectCount = correctInSkill,
                TotalQuestions = skillQuestions.Count,
                BandScore = CalculateBandScore(correctInSkill, skillQuestions.Count, skillType)
            };

            result.SkillScores[skillType] = skillScore;
        }

        // Calculate overall band score (average of component scores)
        if (result.SkillScores.Any())
        {
            result.OverallBandScore = Math.Round(
                result.SkillScores.Values.Average(s => s.BandScore) * 2, 
                MidpointRounding.AwayFromZero) / 2; // Round to nearest 0.5
        }

        return result;
    }

    /// <inheritdoc />
    public double CalculateBandScore(int correctCount, int totalQuestions, SkillType skillType)
    {
        if (totalQuestions == 0)
            return 0;

        var percentage = (double)correctCount / totalQuestions * 100;

        // Simplified IELTS-style band score conversion
        // In real IELTS, the conversion varies by test version
        return percentage switch
        {
            >= 97 => 9.0,
            >= 93 => 8.5,
            >= 87 => 8.0,
            >= 80 => 7.5,
            >= 73 => 7.0,
            >= 65 => 6.5,
            >= 57 => 6.0,
            >= 50 => 5.5,
            >= 42 => 5.0,
            >= 35 => 4.5,
            >= 27 => 4.0,
            >= 20 => 3.5,
            >= 13 => 3.0,
            >= 7 => 2.5,
            >= 3 => 2.0,
            > 0 => 1.0,
            _ => 0
        };
    }

    /// <summary>
    /// Normalize fill-in-the-blank answers for comparison
    /// </summary>
    private static string NormalizeFillInBlankAnswer(string answer)
    {
        if (string.IsNullOrWhiteSpace(answer))
            return string.Empty;

        // Trim, lowercase, remove extra spaces
        return string.Join(" ", answer.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    /// <summary>
    /// Extract answer text from UserAnswer entity
    /// </summary>
    private static string? GetAnswerText(UserAnswer? userAnswer)
    {
        if (userAnswer is null)
            return null;

        // TextContent is used for fill-in-blank and essay
        if (!string.IsNullOrWhiteSpace(userAnswer.TextContent))
            return userAnswer.TextContent;

        // SelectedOptions is used for MCQ (stored as JSON array or comma-separated)
        if (!string.IsNullOrWhiteSpace(userAnswer.SelectedOptions))
            return userAnswer.SelectedOptions;

        return null;
    }
}
