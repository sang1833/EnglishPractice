import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TestAttemptService } from '../../core/services/test-attempt.service';
import { ThemeService } from '../../core/services/theme.service';
import { TestResultDto, SkillResultDto, SkillType } from '../../core/models';


Chart.register(...registerables);

@Component({
  selector: 'app-test-result',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="py-8 px-4 pb-16 min-h-screen bg-background">
      <div class="max-w-[900px] mx-auto relative">
        @if (isLoading()) {
          <div class="text-center py-16 px-8">
            <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your results...</p>
          </div>
        }

        @if (result()) {
          <!-- Confetti overlay for Game theme -->
          @if (isGameMode() && showConfetti()) {
            <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              @for (i of confettiPieces; track i) {
                <div 
                  class="absolute w-[10px] h-[10px] bg-primary -top-[10px] left-[calc(var(--x)*1%)] animate-confetti-fall rounded-[2px]" 
                  [style.--delay]="i * 0.1 + 's'" 
                  [style.--x]="getRandomX()"
                  [class.bg-[#ffd700]]="i % 4 === 0"
                  [class.w-[8px]]="i % 4 === 0"
                  [class.h-[8px]]="i % 4 === 0"
                  [class.bg-[#ff69b4]]="i % 4 === 1"
                  [class.w-[12px]]="i % 4 === 1"
                  [class.h-[6px]]="i % 4 === 1"
                  [class.bg-[#00bfff]]="i % 4 === 2"
                  [class.w-[6px]]="i % 4 === 2"
                  [class.h-[12px]]="i % 4 === 2"
                  [class.bg-[#32cd32]]="i % 4 === 3"
                ></div>
              }
            </div>
          }

          <!-- Hero Score Section -->
          <section class="mb-8">
            <div class="bg-[image:var(--gradient-primary)] rounded-[2rem] p-12 text-center text-text-inverse shadow-[var(--shadow-lg)]" [class.animate-celebrate]="celebrateState() === 'success'">
              <h1 
                class="text-2xl font-semibold m-0 mb-6"
                [class.text-[1.75rem]]="isGameMode()"
                [class.animate-pulse-text]="isGameMode()"
              >
                @if (isGameMode()) {
                  🎉🏆 Amazing Job! 🏆🎉
                } @else {
                  🎉 Test Completed!
                }
              </h1>
              <div class="flex flex-col items-center gap-2">
                <span class="text-sm uppercase tracking-widest opacity-90">Overall Band Score</span>
                <span 
                  class="text-[5rem] font-bold leading-none"
                  [class.animate-score-pop]="isGameMode()"
                >{{ result()!.overallBandScore.toFixed(1) }}</span>
              </div>
              <p class="mt-6 opacity-90">
                {{ getScoreDescription(result()!.overallBandScore) }}
              </p>
              @if (isGameMode()) {
                <div class="mt-6">
                  <span class="inline-block bg-white/20 py-2 px-4 rounded-full font-bold text-lg animate-xp-glow">+{{ getXpEarned() }} XP</span>
                </div>
              }
            </div>
          </section>

          <!-- Skills Breakdown -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-text mb-4">Skills Breakdown</h2>
            <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              @for (skill of result()!.skillResults; track skill.skill; let i = $index) {
                <div 
                  class="bg-surface rounded-xl p-6 shadow-[var(--shadow-sm)]" 
                >
                  <div class="text-3xl mb-3" [class.animate-icon-bounce]="isGameMode()">{{ getSkillIcon(skill.skill) }}</div>
                  <div class="flex justify-between items-center mb-3">
                    <span class="font-semibold text-text">{{ formatSkill(skill.skill) }}</span>
                    <span class="text-2xl font-bold text-primary">{{ skill.bandScore.toFixed(1) }}</span>
                  </div>
                  <div class="text-sm text-text-muted">
                    <span>{{ skill.correctCount }} / {{ skill.totalQuestions }} correct</span>
                    <div class="h-2 bg-border rounded-full mt-2 overflow-hidden">
                      <div
                        class="h-full bg-[image:var(--gradient-primary)] rounded-full transition-[width] duration-500 ease"
                        [class.animate-progress-grow]="isGameMode()"
                        [class.w-0]="isGameMode()"
                        [class.!w-0]="isGameMode()"
                        [style.width.%]="(skill.correctCount / skill.totalQuestions) * 100"
                      ></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Chart Section -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-text mb-4">Performance Chart</h2>
            <div class="bg-surface rounded-xl p-6 shadow-[var(--shadow-sm)]">
              <canvas #chartCanvas></canvas>
            </div>
          </section>

          <!-- Question Review (collapsed by default) -->
          <section class="mb-8">
            <button 
              class="w-full p-4 bg-surface border border-border rounded-lg text-base font-medium text-text cursor-pointer transition-all hover:bg-surface-alt" 
              [class.hover:scale-102]="isGameMode()"
              [class.active:scale-98]="isGameMode()"
              (click)="toggleReview()"
            >
              {{ showReview() ? '▲ Hide' : '▼ Show' }} Detailed Review
              ({{ result()!.questionResults.length }} questions)
            </button>

            <!-- Review Section with CSS Grid Transition -->
            <div class="grid transition-[grid-template-rows] duration-300 ease-out"
                 [class.grid-rows-[1fr]]="showReview()"
                 [class.grid-rows-[0fr]]="!showReview()">
              <div class="overflow-hidden">
                <div class="mt-4 bg-surface rounded-lg overflow-hidden shadow-[var(--shadow-sm)]">
                  @for (qr of result()!.questionResults; track qr.questionId; let i = $index) {
                    <div 
                      class="flex items-start gap-4 p-4 lg:px-5 border-b border-border last:border-b-0" 
                      [class.bg-success/10]="qr.isCorrect" 
                      [class.bg-error/10]="!qr.isCorrect"
                    >
                      <span class="shrink-0 w-7 h-7 bg-border rounded-full flex items-center justify-center text-xs font-semibold text-text">{{ i + 1 }}</span>
                      <div class="flex-1">
                        <p class="m-0 mb-2 text-text" [innerHTML]="qr.questionContent || 'Question ' + (i + 1)"></p>
                        <div class="flex flex-col gap-1 text-sm">
                          <span class="text-text">
                            Your answer: <strong>{{ qr.userAnswer || '(no answer)' }}</strong>
                          </span>
                          @if (!qr.isCorrect) {
                            <span class="text-success">
                              Correct: <strong>{{ qr.correctAnswer }}</strong>
                            </span>
                          }
                        </div>
                      </div>
                      <span class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold"
                        [class.bg-success]="qr.isCorrect"
                        [class.text-text-inverse]="qr.isCorrect"
                        [class.bg-error]="!qr.isCorrect"
                        [class.text-text-inverse]="!qr.isCorrect"
                      >
                        {{ qr.isCorrect ? '✓' : '✗' }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Actions -->
          <section class="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a 
              routerLink="/dashboard" 
              class="inline-flex items-center justify-center p-4 px-8 rounded-lg text-base font-semibold no-underline cursor-pointer transition-all border-none bg-[image:var(--gradient-primary)] text-text-inverse hover:translate-y-[-2px] hover:shadow-[var(--shadow-hover)]"
              [class.hover:scale-105]="isGameMode()"
              [class.active:scale-95]="isGameMode()"
            >
              @if (isGameMode()) {
                🚀 Try Another Test
              } @else {
                Try Another Test
              }
            </a>
            <a 
              routerLink="/history" 
              class="inline-flex items-center justify-center p-4 px-8 rounded-lg text-base font-semibold no-underline cursor-pointer transition-all border border-border bg-surface text-text hover:bg-surface-alt"
              [class.hover:scale-105]="isGameMode()"
              [class.active:scale-95]="isGameMode()"
            >
              @if (isGameMode()) {
                📊 View History
              } @else {
                View Test History
              }
            </a>
          </section>
        }
      </div>
    </div>
  `
})
export class TestResultComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testAttemptService = inject(TestAttemptService);
  private readonly themeService = inject(ThemeService);

  protected result = signal<TestResultDto | null>(null);
  protected isLoading = signal(true);
  protected showReview = signal(false);
  protected showConfetti = signal(false);
  protected celebrateState = signal('');
  private chart?: Chart;

  // Confetti pieces for Game theme
  protected confettiPieces = Array.from({ length: 50 }, (_, i) => i);

  ngOnInit(): void {
    this.loadResult();
  }

  ngAfterViewInit(): void {
    // Chart will be created after result loads
  }

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected getRandomX(): string {
    return (Math.random() * 100).toString();
  }

  protected getXpEarned(): number {
    const result = this.result();
    if (!result) return 0;
    // XP based on score: base 50 + score * 20
    return Math.round(50 + result.overallBandScore * 20);
  }

  private loadResult(): void {
    const attemptId = this.route.snapshot.paramMap.get('id');
    if (!attemptId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.testAttemptService.getAttemptResult(attemptId).subscribe({
      next: (result) => {
        this.result.set(result);
        this.isLoading.set(false);
        setTimeout(() => this.createChart(), 100);

        // Trigger Game theme celebrations
        if (this.isGameMode()) {
          this.showConfetti.set(true);
          this.celebrateState.set('success');
          // Hide confetti after animation
          setTimeout(() => this.showConfetti.set(false), 4000);
        }
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private createChart(): void {
    if (!this.chartCanvas || !this.result()) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const skillResults = this.result()!.skillResults;
    const labels = skillResults.map((s) => this.formatSkill(s.skill));
    const scores = skillResults.map((s) => s.bandScore);

    // Get computed style to use theme colors
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--color-primary').trim() || '#667eea';

    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Your Score',
            data: scores,
            backgroundColor: `${primaryColor}33`,
            borderColor: primaryColor,
            borderWidth: 2,
            pointBackgroundColor: primaryColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: primaryColor
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 9,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  protected toggleReview(): void {
    this.showReview.set(!this.showReview());
  }

  protected formatSkill(skill: SkillType): string {
    switch (skill) {
      case SkillType.Listening: return 'Listening';
      case SkillType.Reading: return 'Reading';
      case SkillType.Writing: return 'Writing';
      case SkillType.Speaking: return 'Speaking';
      default: return 'Other';
    }
  }

  protected getSkillIcon(skill: SkillType): string {
    switch (skill) {
      case SkillType.Listening: return '🎧';
      case SkillType.Reading: return '📖';
      case SkillType.Writing: return '✍️';
      case SkillType.Speaking: return '🎤';
      default: return '📝';
    }
  }

  protected getScoreDescription(score: number): string {
    if (this.isGameMode()) {
      if (score >= 8) return '🌟 Legendary! You\'re a language master!';
      if (score >= 7) return '🔥 Impressive! Keep up the momentum!';
      if (score >= 6) return '💪 Great job! You\'re making progress!';
      if (score >= 5) return '👍 Nice work! Practice makes perfect!';
      if (score >= 4) return '🎯 Good start! Keep practicing!';
      return '🚀 Every journey starts with a step!';
    }
    if (score >= 8) return 'Excellent! You are an expert user.';
    if (score >= 7) return 'Very good! You have operational command.';
    if (score >= 6) return 'Good! You are a competent user.';
    if (score >= 5) return 'Modest. You have partial command of the language.';
    if (score >= 4) return 'Limited. Basic competence is developing.';
    return 'Keep practicing to improve your score!';
  }
}
