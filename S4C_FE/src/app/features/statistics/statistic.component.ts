import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatisticService } from '../../core/services/statistic.service';
import { ThemeService } from '../../core/services/theme.service';
import { StatisticResponse, StatisticPeriod } from '../../core/models/statistic.models';
import { Subscription } from 'rxjs/internal/Subscription';


Chart.register(...registerables);

@Component({
  selector: 'app-statistic',
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="py-8 px-4 pb-16 min-h-screen bg-background" [class.game-mode]="isGameMode()">
      <div class="max-w-[1200px] mx-auto">
        <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-text m-0 mb-2">
              @if (isGameMode()) {
                 {{ 'STATISTICS.TITLE_GAME' | translate }}
              } @else {
                 {{ 'STATISTICS.TITLE_NORMAL' | translate }}
              }
            </h1>
            <p class="text-text-muted m-0">{{ 'STATISTICS.SUBTITLE' | translate }}</p>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-2">
            <select
              class="py-2 px-3 border border-border rounded-md text-sm bg-surface text-text focus:outline-none focus:border-primary"
              [class.border-2]="isGameMode()"
              [class.rounded-lg]="isGameMode()"
              [(ngModel)]="selectedPeriod"
              (ngModelChange)="onFilterChange()"
            >
              <option value="week">{{ 'STATISTICS.FILTER_PERIOD.WEEK' | translate }}</option>
              <option value="month">{{ 'STATISTICS.FILTER_PERIOD.MONTH' | translate }}</option>
              <option value="year">{{ 'STATISTICS.FILTER_PERIOD.YEAR' | translate }}</option>
            </select>

            <select
              class="py-2 px-3 border border-border rounded-md text-sm bg-surface text-text focus:outline-none focus:border-primary"
              [class.border-2]="isGameMode()"
              [class.rounded-lg]="isGameMode()"
              [(ngModel)]="selectedExamType"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">{{ 'STATISTICS.FILTER_EXAM.ALL' | translate }}</option>
              <option value="IeltsAcademic">{{ 'COMMON.EXAM_TYPE.ACADEMIC' | translate }}</option>
              <option value="IeltsGeneral">{{ 'COMMON.EXAM_TYPE.GENERAL' | translate }}</option>
              <option value="Toeic">{{ 'COMMON.EXAM_TYPE.TOEIC' | translate }}</option>
            </select>
          </div>
        </header>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
            <p class="text-text-muted">{{ 'STATISTICS.LOADING' | translate }}</p>
          </div>
        } @else if (data()) {
          <!-- Summary Cards -->
          <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <!-- Total Attempts -->
            <div 
              class="bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50"
              [class.hover:-translate-y-1]="isGameMode()"
              [class.transition-transform]="isGameMode()"
            >
              <div class="text-text-muted text-sm font-medium mb-1 uppercase tracking-wider">{{ 'STATISTICS.TOTAL_TESTS' | translate }}</div>
              <div class="text-3xl font-bold text-primary">{{ data()!.summary.totalAttempts }}</div>
              <div class="text-xs text-text-muted mt-2">{{ 'STATISTICS.COMPLETED_ATTEMPTS' | translate }}</div>
            </div>

            <!-- Avg Score -->
            <div 
              class="bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50"
              [class.hover:-translate-y-1]="isGameMode()"
              [class.transition-transform]="isGameMode()"
            >
              <div class="text-text-muted text-sm font-medium mb-1 uppercase tracking-wider">{{ 'STATISTICS.AVG_SCORE' | translate }}</div>
              <div class="text-3xl font-bold text-text">{{ data()!.summary.averageOverallScore.toFixed(1) }}</div>
              <div class="text-xs text-text-muted mt-2">{{ 'STATISTICS.OVERALL_BAND_SCORE' | translate }}</div>
            </div>

            <!-- Practice Hours -->
            <div 
              class="bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50"
              [class.hover:-translate-y-1]="isGameMode()"
              [class.transition-transform]="isGameMode()"
            >
              <div class="text-text-muted text-sm font-medium mb-1 uppercase tracking-wider">{{ 'STATISTICS.STUDY_TIME' | translate }}</div>
              <div class="text-3xl font-bold text-[#ed8936]">{{ data()!.summary.totalPracticeHours.toFixed(1) }}h</div>
              <div class="text-xs text-text-muted mt-2">{{ 'STATISTICS.TOTAL_DURATION' | translate }}</div>
            </div>

            <!-- Highest Score -->
            <div 
              class="bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50"
              [class.hover:-translate-y-1]="isGameMode()"
              [class.transition-transform]="isGameMode()"
            >
              <div class="text-text-muted text-sm font-medium mb-1 uppercase tracking-wider">{{ 'STATISTICS.BEST_SCORE' | translate }}</div>
              <div class="text-3xl font-bold text-success">{{ data()!.summary.highestOverallScore.toFixed(1) }}</div>
              <div class="text-xs text-text-muted mt-2">{{ 'STATISTICS.PERSONAL_BEST' | translate }}</div>
            </div>
          </section>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Trend Chart -->
             <section class="lg:col-span-2 bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50">
               <h3 class="text-lg font-semibold text-text mb-6">{{ 'STATISTICS.SCORE_HISTORY' | translate }}</h3>
               <div class="relative h-[300px] w-full">
                 <canvas #trendChartCanvas></canvas>
               </div>
             </section>

             <!-- Skill Radar -->
             <section class="bg-surface p-6 rounded-xl shadow-[var(--shadow-sm)] border border-border/50">
               <h3 class="text-lg font-semibold text-text mb-6">{{ 'STATISTICS.SKILL_BALANCE' | translate }}</h3>
               <div class="relative h-[300px] w-full flex items-center justify-center">
                 <canvas #radarChartCanvas></canvas>
               </div>
             </section>
          </div>
        } @else {
          <div class="text-center py-20 bg-surface rounded-xl border border-border">
            <p class="text-text-muted text-lg">{{ 'STATISTICS.NO_DATA' | translate }}</p>
            <button class="mt-4 text-primary font-medium bg-transparent border-none cursor-pointer hover:underline" (click)="loadData()">{{ 'STATISTICS.RETRY' | translate }}</button>
          </div>
        }
      </div>
    </div>
  `
})
export class StatisticComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChartCanvas') trendChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChartCanvas') radarChartCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly statisticService = inject(StatisticService);
  private readonly themeService = inject(ThemeService);
  private readonly translateService = inject(TranslateService);
  private langChangeSubscription?: Subscription;

  protected data = signal<StatisticResponse | null>(null);
  protected isLoading = signal(false);

  // Filters
  protected selectedPeriod: StatisticPeriod = 'week';
  protected selectedExamType: string | null = null;

  private trendChart?: Chart;
  private radarChart?: Chart;

  ngOnInit(): void {
    this.loadData();

    // Listen to language changes to update charts
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
      if (this.data()) {
        this.renderCharts();
      }
    });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Charts init handled in loadData success callback
  }

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected loadData(): void {
    this.isLoading.set(true);

    this.statisticService.getStatistics(
      this.selectedPeriod,
      this.selectedExamType || undefined
    ).subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
        // Small delay to let DOM update before rendering charts
        setTimeout(() => this.renderCharts(), 100);
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.isLoading.set(false);
      }
    });
  }

  protected onFilterChange(): void {
    this.loadData();
  }

  private renderCharts(): void {
    if (!this.data()) return;

    this.renderTrendChart();
    this.renderRadarChart();
  }

  private renderTrendChart(): void {
    if (!this.trendChartCanvas) return;
    if (this.trendChart) this.trendChart.destroy();

    const ctx = this.trendChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.data()!.chartData;

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--color-primary').trim() || '#667eea';
    const textColor = styles.getPropertyValue('--color-text').trim() || '#333';
    const gridColor = styles.getPropertyValue('--color-border').trim() || '#e2e8f0';

    // Get translated label
    const overallScoreLabel = this.translateService.instant('STATISTICS.CHART.OVERALL_SCORE');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `${primaryColor}66`); // 40% opacity
    gradient.addColorStop(1, `${primaryColor}00`); // 0% opacity

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map(d => d.label),
        datasets: [{
          label: overallScoreLabel,
          data: chartData.map(d => d.overall),
          borderColor: primaryColor,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: styles.getPropertyValue('--color-surface').trim(),
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 9,
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          }
        }
      }
    });
  }

  private renderRadarChart(): void {
    if (!this.radarChartCanvas) return;
    if (this.radarChart) this.radarChart.destroy();

    const ctx = this.radarChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const skillAvgs = this.data()!.summary.skillAverages;

    // Translate labels for skills
    const labels = Object.keys(skillAvgs).map(skillName => {
      // Map backend skill names to translation keys if needed, or assume they match common keys
      // The API returns "Listening", "Reading" etc. matching our keys
      return this.translateService.instant(`COMMON.SKILLS.${skillName.toUpperCase()}`);
    });
    const data = Object.values(skillAvgs);

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--color-primary').trim() || '#667eea';
    const textColor = styles.getPropertyValue('--color-text').trim() || '#333';
    const gridColor = styles.getPropertyValue('--color-border').trim() || '#e2e8f0';

    // Get translated dataset label
    const avgScaleLabel = this.translateService.instant('STATISTICS.CHART.AVERAGE_SCALE');

    this.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: avgScaleLabel,
          data: data,
          backgroundColor: `${primaryColor}33`,
          borderColor: primaryColor,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 9,
            ticks: { stepSize: 2, display: false }, // Hide internal numbers for cleaner look
            grid: { color: gridColor },
            pointLabels: {
              color: textColor,
              font: { size: 12, weight: 'bold' }
            },
            angleLines: { color: gridColor }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
