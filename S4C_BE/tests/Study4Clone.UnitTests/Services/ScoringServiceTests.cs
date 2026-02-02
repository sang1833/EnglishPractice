using FluentAssertions;
using Study4Clone.Application.Services;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.UnitTests.Services;

public class ScoringServiceTests
{
    private readonly ScoringService _service;

    public ScoringServiceTests()
    {
        _service = new ScoringService();
    }

    [Fact]
    public void CalculateTestScore_PracticeMode_IgnoresUnselectedSkills()
    {
        // Arrange
        var attempt = new TestAttempt
        {
            Id = Guid.NewGuid(),
            SelectedSkills = "Reading"
        };

        // Create questions for Reading and Listening
        var readingQuestion = CreateQuestion(SkillType.Reading, "A", "A", 1);
        var listeningQuestion = CreateQuestion(SkillType.Listening, "B", "B", 1);

        var questions = new List<Question> { readingQuestion, listeningQuestion };

        // User answers correctly for BOTH (even though Listening shouldn't be scored)
        attempt.Answers = new List<UserAnswer>
        {
            new UserAnswer { QuestionId = readingQuestion.Id, TextContent = "A" },
            new UserAnswer { QuestionId = listeningQuestion.Id, TextContent = "B" }
        };

        // Act
        var result = _service.CalculateTestScore(attempt, questions);

        // Assert
        result.SkillScores.Should().ContainKey(SkillType.Reading);
        result.SkillScores[SkillType.Reading].BandScore.Should().BeGreaterThan(0); // Should have score

        // Listening should NOT be in the result (or counts as not scored)
        // Based on implementation: "if (!questionsBySkill.ContainsKey(skillType))" ... it adds list.
        // But if loop skipped, it won't add key.
        result.SkillScores.Should().NotContainKey(SkillType.Listening);

        // Overall Band Score should be equal to Reading Score (Average of 1 item)
        result.OverallBandScore.Should().Be(result.SkillScores[SkillType.Reading].BandScore);
    }
    
    [Fact]
    public void CalculateTestScore_FullTest_CalculatesAllSkills()
    {
        // Arrange
        var attempt = new TestAttempt
        {
            Id = Guid.NewGuid(),
            SelectedSkills = null // Full Test
        };

        var readingQuestion = CreateQuestion(SkillType.Reading, "A", "A", 1);
        var listeningQuestion = CreateQuestion(SkillType.Listening, "B", "B", 1);

        var questions = new List<Question> { readingQuestion, listeningQuestion };

        attempt.Answers = new List<UserAnswer>
        {
            new UserAnswer { QuestionId = readingQuestion.Id, TextContent = "A" },
            new UserAnswer { QuestionId = listeningQuestion.Id, TextContent = "B" }
        };

        // Act
        var result = _service.CalculateTestScore(attempt, questions);

        // Assert
        result.SkillScores.Should().ContainKey(SkillType.Reading);
        result.SkillScores.Should().ContainKey(SkillType.Listening);
        
        // Overall should be average of 2 skills
        // Reading: 1/1 correct -> High band logic (simplified in Mock service, maybe 9.0?)
        // Listening: 1/1 correct -> 9.0
        // Avg -> 9.0
        result.OverallBandScore.Should().Be(9.0);
    }

    private static Question CreateQuestion(SkillType skill, string correct, string userAns, int points)
    {
        return new Question
        {
            Id = Guid.NewGuid(),
            CorrectAnswer = correct,
            Points = points,
            Group = new QuestionGroup
            {
                Section = new ExamSection
                {
                    Skill = new ExamSkill
                    {
                        Skill = skill
                    }
                },
                QuestionType = QuestionType.MultipleChoice
            }
        };
    }
}
