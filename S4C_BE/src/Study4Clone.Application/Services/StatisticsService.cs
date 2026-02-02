using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Services;

public class StatisticsService : IStatisticsService
{
    private readonly ITestAttemptRepository _attemptRepository;

    public StatisticsService(ITestAttemptRepository attemptRepository)
    {
        _attemptRepository = attemptRepository;
    }

    public async Task<Result<StatisticsResponse>> GetUserStatisticsAsync(
        Guid userId,
        StatisticsRequest request,
        CancellationToken cancellationToken = default)
    {
        // 1. Determine Date Range
        DateTime? fromDate = null;
        DateTime? toDate = DateTime.UtcNow;

        switch (request.Period?.ToLower())
        {
            case "week":
                fromDate = DateTime.UtcNow.AddDays(-7);
                break;
            case "month":
                fromDate = DateTime.UtcNow.AddDays(-30);
                break;
            case "year":
                fromDate = DateTime.UtcNow.AddMonths(-12);
                break;
            default:
                // If period is custom or not specified, use explicit dates if provided
                // Otherwise default to month
                if (request.Period == null) fromDate = DateTime.UtcNow.AddDays(-30);
                break;
        }

        // 2. Fetch Data
        var attempts = await _attemptRepository.GetCompletedAttemptsAsync(
            userId,
            fromDate,
            toDate,
            request.ExamType,
            request.Skill,
            cancellationToken);

        if (!attempts.Any())
        {
            return Result<StatisticsResponse>.Success(new StatisticsResponse(
                new StatisticsSummary(0, 0, 0, 0, 0, new Dictionary<string, double>()),
                new List<ChartDataPoint>()
            ));
        }

        // 3. Calculate Summary
        var summary = CalculateSummary(attempts);

        // 4. Calculate Chart Data
        var chartData = CalculateChartData(attempts, request.Period);

        return Result<StatisticsResponse>.Success(new StatisticsResponse(summary, chartData));
    }

    private StatisticsSummary CalculateSummary(List<Study4Clone.Domain.Entities.TestAttempt> attempts)
    {
        var totalAttempts = attempts.Count;
        
        // Calculate Total Practice Hours
        var totalSeconds = attempts.Sum(a => 
        {
            if (a.CompletedAt.HasValue)
                return (a.CompletedAt.Value - a.StartedAt).TotalSeconds;
            return 0;
        });
        var totalHours = Math.Round(totalSeconds / 3600, 1);

        // Average Overall
        var avgOverall = attempts
            .Where(a => a.OverallScore.HasValue)
            .Select(a => a.OverallScore.Value)
            .DefaultIfEmpty(0)
            .Average();
        
        // Determine Highest Overall
        var highestOverall = attempts
            .Where(a => a.OverallScore.HasValue)
            .Select(a => a.OverallScore.Value)
            .DefaultIfEmpty(0)
            .Max();

        // Average Accuracy (Weighted by question count)
        // Alternatively, average of percentages: attempts.Average(a => correct/total)
        // Design choice: (Total Correct across all tests) / (Total Questions across all tests)
        double avgAccuracy = 0;
        var totalCorrect = attempts.Sum(a => a.CorrectQuestionCount);
        var totalQuestions = attempts.Sum(a => a.TotalQuestionCount);
        
        if (totalQuestions > 0)
        {
            avgAccuracy = Math.Round((double)totalCorrect / totalQuestions * 100, 1);
        }

        // Skill Averages
        var skillAverages = new Dictionary<string, double>();
        
        AddSkillAverage(attempts, skillAverages, SkillType.Listening, a => a.ListeningScore);
        AddSkillAverage(attempts, skillAverages, SkillType.Reading, a => a.ReadingScore);
        AddSkillAverage(attempts, skillAverages, SkillType.Writing, a => a.WritingScore);
        AddSkillAverage(attempts, skillAverages, SkillType.Speaking, a => a.SpeakingScore);

        return new StatisticsSummary(
            totalAttempts,
            totalHours,
            Math.Round(avgOverall, 1),
            highestOverall,
            avgAccuracy,
            skillAverages
        );
    }

    private void AddSkillAverage(
        List<Study4Clone.Domain.Entities.TestAttempt> attempts, 
        Dictionary<string, double> dict, 
        SkillType skill, 
        Func<Study4Clone.Domain.Entities.TestAttempt, double?> selector)
    {
        var scores = attempts.Select(selector).Where(s => s.HasValue).Select(s => s!.Value).ToList();
        if (scores.Any())
        {
            dict[skill.ToString()] = Math.Round(scores.Average(), 1);
        }
    }

    private List<ChartDataPoint> CalculateChartData(List<Study4Clone.Domain.Entities.TestAttempt> attempts, string? period)
    {
        // Determine Grouping Strategy
        // If Period is "year", group by month. Otherwise group by day.
        bool isYearly = string.Equals(period, "year", StringComparison.OrdinalIgnoreCase);

        var grouped = attempts
            .GroupBy(a => isYearly 
                ? new DateTime(a.StartedAt.Year, a.StartedAt.Month, 1) 
                : a.StartedAt.Date)
            .OrderBy(g => g.Key);

        var dataPoints = new List<ChartDataPoint>();

        foreach (var group in grouped)
        {
            var overall = group.Where(a => a.OverallScore.HasValue).Average(a => a.OverallScore);
            var listening = group.Where(a => a.ListeningScore.HasValue).Average(a => a.ListeningScore);
            var reading = group.Where(a => a.ReadingScore.HasValue).Average(a => a.ReadingScore);
            var writing = group.Where(a => a.WritingScore.HasValue).Average(a => a.WritingScore);
            var speaking = group.Where(a => a.SpeakingScore.HasValue).Average(a => a.SpeakingScore);

            // Label formatting
            string label = isYearly 
                ? group.Key.ToString("MMM yyyy") 
                : group.Key.ToString("dd/MM");

            dataPoints.Add(new ChartDataPoint(
                group.Key,
                label,
                overall.HasValue ? Math.Round(overall.Value, 1) : null,
                listening.HasValue ? Math.Round(listening.Value, 1) : null,
                reading.HasValue ? Math.Round(reading.Value, 1) : null,
                writing.HasValue ? Math.Round(writing.Value, 1) : null,
                speaking.HasValue ? Math.Round(speaking.Value, 1) : null,
                group.Count()
            ));
        }

        return dataPoints;
    }
}
