using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

public record StatisticsRequest(
    string Period = "month", // week, month, year
    ExamType? ExamType = null,
    SkillType? Skill = null
);

public record StatisticsResponse(
    StatisticsSummary Summary,
    List<ChartDataPoint> ChartData
);

public record StatisticsSummary(
    int TotalAttempts,
    double TotalPracticeHours, // In hours (TimeTaken / 3600)
    double AverageOverallScore,
    double HighestOverallScore,
    double AverageAccuracy, // % (TotalCorrect / TotalQuestions * 100)
    Dictionary<string, double> SkillAverages
);

public record ChartDataPoint(
    DateTime Date, // Sortable Date (e.g., start of day/month)
    string Label,  // Display Label (e.g., "01/02", "Feb 2024")
    double? Overall,
    double? Listening,
    double? Reading,
    double? Writing,
    double? Speaking,
    int TestCount
);
