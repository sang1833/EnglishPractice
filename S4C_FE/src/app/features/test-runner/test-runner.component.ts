import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { TestAttemptService } from '../../core/services/test-attempt.service';
import {
  Exam,
  ExamSkill,
  ExamSection,
  QuestionGroup,
  Question,
  SubmitAnswerRequest,
  SkillType,
  AttemptStatus
} from '../../core/models';
import { QuestionGroupComponent } from './question-group/question-group.component';
import { QuestionNavigatorComponent } from './question-navigator/question-navigator.component';
import { TimerWarningComponent } from './timer-warning/timer-warning.component';

interface FlatQuestion {
  question: Question;
  group: QuestionGroup;
  section: ExamSection;
  skill: ExamSkill;
  globalIndex: number;
}

@Component({
  selector: 'app-test-runner',
  imports: [CommonModule, QuestionGroupComponent, QuestionNavigatorComponent, TimerWarningComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      @if (isLoading()) {
        <div class="fixed inset-0 bg-white/90 flex flex-col items-center justify-center z-[1000]">
          <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
          <p>Loading test...</p>
        </div>
      }

      @if (exam()) {
        <!-- Timer Warning Toast -->
        <app-timer-warning
          [visible]="showTimerWarning()"
          [timeRemaining]="timeRemaining()"
          (dismiss)="dismissWarning()"
        />

        <!-- Header -->
        <header class="flex items-center justify-between p-4 bg-surface shadow-[var(--shadow-sm)] sticky top-0 z-100 flex-col gap-4 lg:flex-row lg:gap-0">
          <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 class="text-xl font-semibold text-text m-0">{{ exam()!.title }}</h1>
            <span class="text-sm text-primary font-medium">{{ getCurrentSkillName() }}</span>
          </div>
          <div class="flex items-center justify-center">
            <div 
              class="flex items-center gap-2 py-2 px-4 bg-surface-alt rounded-md text-xl font-semibold text-text transition-colors"
              [class.bg-error/10]="timeRemaining() <= 300"
              [class.text-error]="timeRemaining() <= 300"
              [class.animate-pulse]="timeRemaining() <= 300"
            >
              <span>⏱️</span>
              <span>{{ formatTime(timeRemaining()) }}</span>
            </div>
          </div>
          <div class="flex gap-4">
            <button class="py-2 px-4 border-none rounded-md font-medium cursor-pointer transition-all bg-surface-alt text-text hover:bg-border" (click)="pauseTest()" [disabled]="isSubmitting()">
              ⏸️ Pause
            </button>
            <button class="py-2 px-4 border-none rounded-md font-medium cursor-pointer transition-all bg-error text-text-inverse hover:opacity-90" (click)="confirmSubmit()" [disabled]="isSubmitting()">
              Submit Test
            </button>
          </div>
        </header>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden h-[calc(100vh-80px)]">
          <!-- Left Panel - Section Content -->
          <aside class="hidden lg:block flex-1 bg-surface rounded-lg overflow-y-auto max-h-full">
            @if (currentSection()) {
              <div class="p-6">
                @if (currentSection()!.audioUrl) {
                  <div class="mb-6">
                    <audio controls [src]="currentSection()!.audioUrl" class="w-full">
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                }
                @if (currentSection()!.textContent) {
                  <div class="leading-loose text-text" [innerHTML]="currentSection()!.textContent"></div>
                }
                @if (currentSection()!.imageUrl) {
                  <img [src]="currentSection()!.imageUrl" class="max-w-full rounded-md mt-4" alt="Section image" />
                }
              </div>
            }
          </aside>

          <!-- Center Panel - Questions -->
          <main class="flex-[2] overflow-y-auto w-full max-h-full bg-surface rounded-lg lg:bg-transparent">
            <!-- Mobile Section Content (Visible only on mobile) -->
            <div class="lg:hidden p-4 bg-surface rounded-lg mb-4 shadow-sm">
                @if (currentSection()) {
                   @if (currentSection()!.audioUrl) {
                      <div class="mb-4">
                        <audio controls [src]="currentSection()!.audioUrl" class="w-full">
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                   }
                   <button class="w-full py-2 bg-surface-alt text-text rounded-md text-sm mb-2" (click)="toggleMobilePassage()">
                      {{ showMobilePassage() ? 'Hide Passage' : 'Show Passage' }}
                   </button>
                   @if (showMobilePassage() && currentSection()!.textContent) {
                      <div class="p-4 bg-surface-alt rounded-md text-sm leading-relaxed mb-4 max-h-[300px] overflow-y-auto" [innerHTML]="currentSection()!.textContent"></div>
                   }
                }
            </div>

            @for (group of currentGroups(); track group.id) {
              <app-question-group
                [group]="group"
                [answers]="getGroupAnswers(group)"
                (answerChange)="onAnswerChange($event)"
              />
            }
          </main>

          <!-- Right Panel - Navigator -->
          <aside class="hidden lg:block w-[220px] bg-surface rounded-lg p-4 overflow-y-auto max-h-full">
            <app-question-navigator
              [questions]="flatQuestions()"
              [answeredIds]="answeredQuestionIds()"
              [currentIndex]="currentQuestionIndex()"
              (navigate)="navigateToQuestion($event)"
            />
          </aside>
        </div>

        <!-- Mobile Navigation -->
        <nav class="flex lg:hidden items-center justify-between p-4 bg-surface border-t border-border shrink-0 sticky bottom-0 z-50 shadow-md">
          <button
            class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="currentSectionIndex() === 0"
            (click)="previousSection()"
          >
            ← Previous
          </button>
          <span class="text-muted text-sm font-medium">
            Section {{ currentSectionIndex() + 1 }} / {{ totalSections() }}
          </span>
          <button
            class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="currentSectionIndex() >= totalSections() - 1"
            (click)="nextSection()"
          >
            Next →
          </button>
        </nav>

        <!-- Submit Confirmation Modal -->
        @if (showSubmitModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" (click)="cancelSubmit()">
            <div class="bg-surface rounded-xl p-8 max-w-[400px] w-full text-center" (click)="$event.stopPropagation()">
              <h2 class="text-xl font-bold text-text mb-4">Submit Test?</h2>
              <p class="text-muted mb-2">
                You have answered {{ answeredCount() }} of {{ totalQuestions() }} questions.
              </p>
              @if (answeredCount() < totalQuestions()) {
                <p class="text-error font-medium mb-4">
                  ⚠️ {{ totalQuestions() - answeredCount() }} questions are unanswered.
                </p>
              }
              <div class="flex gap-4 mt-6">
                <button class="flex-1 py-3 px-4 border-none rounded-lg font-medium cursor-pointer transition-all bg-surface-alt text-text hover:bg-border" (click)="cancelSubmit()">
                  Continue Test
                </button>
                <button
                  class="flex-1 py-3 px-4 border-none rounded-lg font-medium cursor-pointer transition-all bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  [disabled]="isSubmitting()"
                  (click)="submitTest()"
                >
                  @if (isSubmitting()) {
                    <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span> Submitting...
                  } @else {
                    Submit Test
                  }
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class TestRunnerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly testAttemptService = inject(TestAttemptService);

  // State
  protected exam = signal<Exam | null>(null);
  protected attemptId = signal<string | null>(null);
  protected isLoading = signal(true);
  protected isSubmitting = signal(false);
  protected showSubmitModal = signal(false);
  protected showTimerWarning = signal(false);
  protected warningDismissed = signal(false);
  protected showMobilePassage = signal(false);

  // Timer
  protected timeRemaining = signal(0);
  private timerInterval?: ReturnType<typeof setInterval>;

  // Navigation
  protected currentSkillIndex = signal(0);
  protected currentSectionIndex = signal(0);
  protected currentQuestionIndex = signal(0);

  // Computed
  protected flatQuestions = computed<FlatQuestion[]>(() => {
    const exam = this.exam();
    if (!exam) return [];

    const flat: FlatQuestion[] = [];
    let globalIndex = 0;

    exam.skills.forEach((skill: ExamSkill) => {
      skill.sections.forEach((section: ExamSection) => {
        section.groups.forEach((group: QuestionGroup) => {
          group.questions.forEach((question: Question) => {
            flat.push({ question, group, section, skill, globalIndex });
            globalIndex++;
          });
        });
      });
    });

    return flat;
  });

  protected totalQuestions = computed(() => this.flatQuestions().length);
  protected totalSections = computed(() => {
    const exam = this.exam();
    if (!exam) return 0;
    return exam.skills.reduce((sum, s) => sum + s.sections.length, 0);
  });

  protected answeredQuestionIds = computed(() => {
    const ids = new Set<string>();
    this.testAttemptService.draftAnswers().forEach((_, id) => ids.add(id));
    return ids;
  });

  protected answeredCount = computed(() => this.answeredQuestionIds().size);

  protected currentSection = computed<ExamSection | null>(() => {
    const exam = this.exam();
    if (!exam) return null;

    let sectionCount = 0;
    for (const skill of exam.skills) {
      for (const section of skill.sections) {
        if (sectionCount === this.currentSectionIndex()) {
          return section;
        }
        sectionCount++;
      }
    }
    return null;
  });

  protected currentGroups = computed<QuestionGroup[]>(() => {
    const section = this.currentSection();
    return section?.groups || [];
  });

  ngOnInit(): void {
    this.loadTest();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toggleMobilePassage(): void {
    this.showMobilePassage.update(v => !v);
  }

  private loadTest(): void {
    const attemptId = this.route.snapshot.paramMap.get('id');
    if (!attemptId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.attemptId.set(attemptId);

    // Get attempt details
    this.testAttemptService.getAttemptById(attemptId).subscribe({
      next: (attempt) => {
        // Load exam specifically for this attempt (handles full test or practice mode)
        this.testAttemptService.getAttemptExam(attemptId).subscribe({
          next: (exam) => {
            this.exam.set(exam);

            // Check for resume state - use timeRemaining if it's a positive value
            // For new attempts, timeRemaining might be null, so we fallback to exam.duration
            const hasValidRemainingTime = attempt.timeRemaining !== undefined && attempt.timeRemaining > 0;

            if (hasValidRemainingTime) {
              // Resuming with saved time
              this.startTimer(attempt.timeRemaining!);

              // Restore saved answers
              if (attempt.savedAnswers && attempt.savedAnswers.length > 0) {
                attempt.savedAnswers.forEach(ans => this.testAttemptService.saveDraftAnswer(ans));
              }
            } else {
              // New attempt or no saved time - use exam duration (which is adjusted for practice mode)
              this.startTimer(exam.duration * 60);
            }

            this.isLoading.set(false);
          },
          error: () => {
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private startTimer(durationSeconds: number): void {
    this.timeRemaining.set(durationSeconds);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemaining() - 1;
      this.timeRemaining.set(remaining);

      // Show warning at 5 minutes
      if (remaining === 300 && !this.warningDismissed()) {
        this.showTimerWarning.set(true);
      }

      // Auto-submit when time is up
      if (remaining <= 0) {
        this.submitTest();
      }
    }, 1000);
  }

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  protected getCurrentSkillName(): string {
    const section = this.currentSection();
    if (!section) return '';

    const exam = this.exam();
    if (!exam) return '';

    for (const skill of exam.skills) {
      if (skill.sections.some((s) => s.id === section.id)) {
        return skill.title;
      }
    }
    return '';
  }

  protected getGroupAnswers(group: QuestionGroup): Map<string, SubmitAnswerRequest> {
    const answers = new Map<string, SubmitAnswerRequest>();
    group.questions.forEach((q: Question) => {
      const answer = this.testAttemptService.getDraftAnswer(q.id);
      if (answer) {
        answers.set(q.id, answer);
      }
    });
    return answers;
  }

  protected onAnswerChange(answer: SubmitAnswerRequest): void {
    this.testAttemptService.saveDraftAnswer(answer);
  }

  protected navigateToQuestion(index: number): void {
    // Find which section contains this question
    const flat = this.flatQuestions();
    if (index >= 0 && index < flat.length) {
      const target = flat[index];
      const exam = this.exam();
      if (!exam) return;

      let sectionIdx = 0;
      for (const skill of exam.skills) {
        for (const section of skill.sections) {
          if (section.id === target.section.id) {
            this.currentSectionIndex.set(sectionIdx);
            this.currentQuestionIndex.set(index);
            return;
          }
          sectionIdx++;
        }
      }
    }
  }

  protected previousSection(): void {
    if (this.currentSectionIndex() > 0) {
      this.currentSectionIndex.set(this.currentSectionIndex() - 1);
    }
  }

  protected nextSection(): void {
    if (this.currentSectionIndex() < this.totalSections() - 1) {
      this.currentSectionIndex.set(this.currentSectionIndex() + 1);
    }
  }

  protected dismissWarning(): void {
    this.showTimerWarning.set(false);
    this.warningDismissed.set(true);
  }

  protected confirmSubmit(): void {
    this.showSubmitModal.set(true);
  }

  protected cancelSubmit(): void {
    this.showSubmitModal.set(false);
  }

  protected submitTest(): void {
    const attemptId = this.attemptId();
    if (!attemptId) return;

    this.isSubmitting.set(true);
    const answers = this.testAttemptService.getDraftAnswersArray();

    this.testAttemptService.submitTest(attemptId, answers).subscribe({
      next: (result) => {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        this.router.navigate(['/result', result.attemptId]);
      },
      error: (err) => {
        console.error('Submit failed:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  protected pauseTest(): void {
    const attemptId = this.attemptId();
    if (!attemptId) return;

    // Pause timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isSubmitting.set(true); // Show loading state
    const answers = this.testAttemptService.getDraftAnswersArray();
    const timeRemaining = this.timeRemaining();

    this.testAttemptService.pauseTest(attemptId, timeRemaining, answers).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Pause failed:', err);
        this.isSubmitting.set(false);
        // Resume timer if failed
        this.startTimer(timeRemaining);
      }
    });
  }
}
