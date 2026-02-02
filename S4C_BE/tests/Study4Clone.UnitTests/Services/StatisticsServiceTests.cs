using FluentAssertions;
using Moq;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Application.Services;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.UnitTests.Services;

public class StatisticsServiceTests
{
    private readonly Mock<ITestAttemptRepository> _mockRepo;
    private readonly StatisticsService _service;

    public StatisticsServiceTests()
    {
        _mockRepo = new Mock<ITestAttemptRepository>();
        _service = new StatisticsService(_mockRepo.Object);
    }

    [Fact]
    public async Task GetUserStatistics_NoAttempts_ReturnsZeroStats()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetCompletedAttemptsAsync(
            It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<ExamType?>(), It.IsAny<SkillType?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TestAttempt>());

        // Act
        var result = await _service.GetUserStatisticsAsync(Guid.NewGuid(), new StatisticsRequest());

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Summary.TotalAttempts.Should().Be(0);
        result.Value.Summary.AverageAccuracy.Should().Be(0);
        result.Value.ChartData.Should().BeEmpty();
    }

    [Fact]
    public async Task GetUserStatistics_CalculatesSummaryCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var attempts = new List<TestAttempt>
        {
            new() { 
                StartedAt = DateTime.UtcNow.AddDays(-2), 
                CompletedAt = DateTime.UtcNow.AddDays(-2).AddHours(1),
                OverallScore = 6.0,
                TotalQuestionCount = 40,
                CorrectQuestionCount = 20, // 50%
                ReadingScore = 6.0,    // 1 attempt
                ListeningScore = null
            },
            new() { 
                StartedAt = DateTime.UtcNow.AddDays(-1), 
                CompletedAt = DateTime.UtcNow.AddDays(-1).AddHours(1),
                OverallScore = 7.0,
                TotalQuestionCount = 40,
                CorrectQuestionCount = 30, // 75%
                ReadingScore = 7.0,
                ListeningScore = 6.5
            }
        };

        _mockRepo.Setup(r => r.GetCompletedAttemptsAsync(
            userId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<ExamType?>(), It.IsAny<SkillType?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempts);

        // Act
        var result = await _service.GetUserStatisticsAsync(userId, new StatisticsRequest());

        // Assert
        var summary = result.Value!.Summary;
        summary.TotalAttempts.Should().Be(2);
        summary.AverageOverallScore.Should().Be(6.5); // (6+7)/2
        
        // Accuracy: (20+30) / (40+40) = 50/80 = 62.5%
        summary.AverageAccuracy.Should().Be(62.5);

        // Skills
        summary.SkillAverages["Reading"].Should().Be(6.5); // (6+7)/2
        summary.SkillAverages["Listening"].Should().Be(6.5); // 6.5
    }

    [Fact]
    public async Task GetUserStatistics_GroupsChartDataByDate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var date1 = DateTime.UtcNow.Date.AddDays(-2); // Day 1
        var date2 = DateTime.UtcNow.Date.AddDays(-1); // Day 2

        var attempts = new List<TestAttempt>
        {
            new() { StartedAt = date1.AddHours(10), OverallScore = 6.0 }, 
            new() { StartedAt = date1.AddHours(15), OverallScore = 7.0 }, // Avg Day 1: 6.5
            new() { StartedAt = date2.AddHours(10), OverallScore = 8.0 }  // Avg Day 2: 8.0
        };

        _mockRepo.Setup(r => r.GetCompletedAttemptsAsync(
            userId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<ExamType?>(), It.IsAny<SkillType?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempts);

        // Act
        var result = await _service.GetUserStatisticsAsync(userId, new StatisticsRequest { Period = "month" });

        // Assert
        var chart = result.Value!.ChartData;
        chart.Should().HaveCount(2);

        // Day 1
        chart[0].Date.Date.Should().Be(date1);
        chart[0].Overall.Should().Be(6.5);
        chart[0].TestCount.Should().Be(2);

        // Day 2
        chart[1].Date.Date.Should().Be(date2);
        chart[1].Overall.Should().Be(8.0);
    }

    [Fact]
    public async Task GetUserStatistics_YearPeriod_GroupsByMonth()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var month1 = new DateTime(2024, 1, 15);
        var month2 = new DateTime(2024, 2, 20);

        var attempts = new List<TestAttempt>
        {
            new() { StartedAt = month1, OverallScore = 6.0 }, 
            new() { StartedAt = month2, OverallScore = 7.0 }
        };

        _mockRepo.Setup(r => r.GetCompletedAttemptsAsync(
            userId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<ExamType?>(), It.IsAny<SkillType?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempts);

        // Act
        var result = await _service.GetUserStatisticsAsync(userId, new StatisticsRequest { Period = "year" });

        // Assert
        var chart = result.Value!.ChartData;
        
        chart[0].Label.Should().Contain("Jan");
        chart[1].Label.Should().Contain("Feb");
    }
}
