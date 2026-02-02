export interface StatisticSummary {
    totalAttempts: number;
    totalPracticeHours: number;
    averageOverallScore: number;
    highestOverallScore: number;
    averageAccuracy: number;
    skillAverages: { [key: string]: number };
}

export interface ChartDataPoint {
    date: string;
    label: string;
    overall: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    testCount: number;
}

export interface StatisticResponse {
    summary: StatisticSummary;
    chartData: ChartDataPoint[];
}

export type StatisticPeriod = 'week' | 'month' | 'year';

export interface StatisticFilter {
    period: StatisticPeriod;
    examType?: string;
    skill?: string;
}
