import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../core/services/exam.service';
import { TestAttemptService } from '../../core/services/test-attempt.service';
import { AuthService } from '../../core/services/auth.service';
import { ExamDto, ExamSkillListDto, SkillType, ExamType, AttemptStatus, TestAttemptDto } from '../../core/models';

@Component({
  selector: 'app-exam-detail',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-12">
      <div class="max-w-[1000px] mx-auto px-4">
        @if (isLoading()) {
          <div class="text-center py-16 px-8 bg-surface rounded-lg">
            <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading exam details...</p>
          </div>
        }

        @if (errorMessage()) {
          <div class="text-center py-16 px-8 bg-surface rounded-lg">
            <p class="text-error mb-4">{{ errorMessage() }}</p>
            <button class="px-6 py-3 rounded-md border-none font-medium cursor-pointer transition-all bg-[image:var(--gradient-primary)] text-text-inverse" (click)="loadExam()">Try Again</button>
          </div>
        }

        @if (exam()) {
          <article>
            <!-- Hero Section -->
            <header class="flex flex-col-reverse md:flex-row gap-8 bg-surface rounded-xl overflow-hidden shadow-[var(--shadow-card)] mb-8">
              <div class="p-8 flex-1">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4"
                  [ngClass]="{
                    'bg-primary text-text-inverse': exam()!.type === 'IeltsAcademic',
                    'bg-success text-text-inverse': exam()!.type === 'IeltsGeneral',
                    'bg-muted text-text-inverse': exam()!.type !== 'IeltsAcademic' && exam()!.type !== 'IeltsGeneral'
                  }"
                >
                  {{ formatType(exam()!.type) }}
                </span>
                <h1 class="text-3xl md:text-4xl font-bold text-text mb-4">{{ exam()!.title }}</h1>
                @if (exam()!.description) {
                  <p class="text-muted leading-relaxed mb-6">{{ exam()!.description }}</p>
                }
                <div class="flex flex-wrap gap-6">
                  <span class="flex items-center gap-2 text-text font-medium">
                    <span class="text-xl">⏱️</span>
                    {{ exam()!.duration }} minutes
                  </span>
                  <span class="flex items-center gap-2 text-text font-medium">
                    <span class="text-xl">📝</span>
                    {{ getTotalSections() }} sections
                  </span>
                </div>
              </div>
              <div class="h-[200px] md:w-[300px] md:h-auto md:min-h-[250px] bg-[image:var(--gradient-primary)] relative">
                @if (exam()!.thumbnailUrl) {
                  <img [src]="exam()!.thumbnailUrl" [alt]="exam()!.title" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-6xl opacity-30">
                    <span>📝</span>
                  </div>
                }
              </div>
            </header>

            <!-- Skills Overview -->
            <section class="bg-surface rounded-xl p-8 mb-8 shadow-[var(--shadow-card)]">
              <h2 class="text-xl font-semibold text-text mb-6">Test Structure</h2>
              <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                @for (skill of skills(); track skill.id) {
                  <div class="flex items-center gap-4 p-4 bg-surface-alt rounded-lg transition-transform hover:translate-x-1">
                    <div class="w-12 h-12 bg-[image:var(--gradient-primary)] rounded-lg flex items-center justify-center text-2xl">{{ getSkillIcon(skill.skill) }}</div>
                    <div>
                      <h3 class="text-base font-semibold text-text mb-1">{{ skill.title }}</h3>
                      <p class="text-sm text-muted m-0">
                        {{ skill.sectionCount }} parts • {{ skill.duration }} mins
                      </p>
                    </div>
                  </div>
                }
              </div>
            </section>

            <!-- Mode Selection -->
            <section class="my-8">
                <h2 class="text-xl font-semibold text-text mb-6">Test Mode</h2>
                <div class="flex gap-4 flex-wrap">
                    <label 
                      class="flex-1 min-w-[200px] flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer transition-all bg-surface hover:border-border-hover"
                      [class.border-primary]="!isPracticeMode()"
                      [class.bg-primary-light]="!isPracticeMode()"
                    >
                        <input type="radio" name="mode" [value]="false" [(ngModel)]="isPracticeMode" class="w-5 h-5 accent-primary m-0" />
                        <span class="flex flex-col">
                            <span class="font-semibold text-text">Full Test</span>
                            <span class="text-sm text-muted">Take the complete exam ({{ exam()!.duration }} mins)</span>
                        </span>
                    </label>
                    <label 
                      class="flex-1 min-w-[200px] flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer transition-all bg-surface hover:border-border-hover"
                      [class.border-primary]="isPracticeMode()"
                      [class.bg-primary-light]="isPracticeMode()"
                    >
                        <input type="radio" name="mode" [value]="true" [(ngModel)]="isPracticeMode" class="w-5 h-5 accent-primary m-0" />
                        <span class="flex flex-col">
                            <span class="font-semibold text-text">Practice Mode</span>
                            <span class="text-sm text-muted">Select specific skills to practice</span>
                        </span>
                    </label>
                </div>
            </section>

            <!-- Skill Selection (Practice Mode) -->
            @if (isPracticeMode()) {
                <section class="bg-surface p-6 rounded-lg mb-8 border border-border">
                    <h3 class="text-base font-semibold text-text mb-4">Select Skills</h3>
                    <div class="flex gap-6 flex-wrap">
                        @for (skill of availableSkills(); track skill) {
                            <label 
                              class="flex items-center gap-2 cursor-pointer select-none"
                              [class.opacity-50]="!isSkillAvailable(skill)"
                              [class.cursor-not-allowed]="!isSkillAvailable(skill)"
                            >
                                <input 
                                    type="checkbox" 
                                    [checked]="isSkillSelected(skill)" 
                                    (change)="toggleSkill(skill)"
                                    [disabled]="!isSkillAvailable(skill)"
                                    class="w-4 h-4 accent-primary"
                                />
                                <span class="font-medium text-text">{{ skill }}</span>
                            </label>
                        }
                    </div>
                </section>
            }

            <!-- Actions -->
            <section class="flex flex-col md:flex-row gap-4">
              <button
                class="inline-flex items-center justify-center gap-2 px-8 py-4 border-none rounded-lg text-lg font-semibold cursor-pointer transition-all bg-[image:var(--gradient-primary)] text-text-inverse hover:translate-y-[-2px] hover:shadow-[var(--shadow-hover)] disabled:opacity-70 disabled:cursor-not-allowed"
                (click)="startTest()"
                [disabled]="isStarting() || (isPracticeMode() && selectedSkills().size === 0)"
              >
                @if (isStarting()) {
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Starting...
                } @else {
                  Start {{ isPracticeMode() ? 'Practice Test' : 'Full Test' }}
                }
              </button>
              <button 
                class="inline-flex items-center justify-center gap-2 px-8 py-4 border-none rounded-lg text-lg font-semibold cursor-pointer transition-all bg-surface-alt text-text hover:bg-border"
                (click)="goBack()"
              >
                ← Back to Tests
              </button>
            </section>
          </article>
        }
      </div>

      <!-- Resume Confirmation Modal -->
      @if (showResumeModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" (click)="cancelResume()">
          <div class="bg-surface rounded-xl p-8 max-w-[400px] w-full text-center" (click)="$event.stopPropagation()">
            <h2 class="text-xl font-bold text-text mb-4">Resume Test?</h2>
            <p class="text-muted mb-2">You have an unfinished attempt for this exam.</p>
            <p class="font-medium text-text mb-6">Started: {{ pendingAttempt()?.startedAt | date:'medium' }}</p>
            <div class="flex gap-4">
              <button class="flex-1 py-3 px-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-surface-alt text-text hover:bg-border" (click)="cancelResume()">Cancel</button>
              <button class="flex-1 py-3 px-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-[var(--shadow-hover)]" (click)="confirmResume()">Resume Test</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ExamDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly testAttemptService = inject(TestAttemptService);
  private readonly authService = inject(AuthService);

  protected exam = signal<ExamDto | null>(null);
  protected skills = signal<ExamSkillListDto[]>([]);
  protected isLoading = signal(false);
  protected isStarting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected showResumeModal = signal(false);
  protected pendingAttempt = signal<TestAttemptDto | null>(null);

  // Practice Mode State
  isPracticeMode = signal(false);
  selectedSkills = signal<Set<string>>(new Set());

  // Available skills to choose from (based on SkillType enum)
  availableSkills = signal<string[]>(['Listening', 'Reading', 'Writing', 'Speaking']);

  ngOnInit(): void {
    this.loadExam();
  }

  isSkillAvailable(skill: string): boolean {
    // If exam has specific availableSkills, strict check. Otherwise allow all (fallback).
    const examSkills = this.exam()?.availableSkills;
    if (examSkills && examSkills.length > 0) {
      return examSkills.includes(skill);
    }
    return true;
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills().has(skill);
  }

  toggleSkill(skill: string): void {
    const current = new Set(this.selectedSkills());
    if (current.has(skill)) {
      current.delete(skill);
    } else {
      current.add(skill);
    }
    this.selectedSkills.set(current);
  }

  protected loadExam(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.errorMessage.set('Invalid exam URL');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.examService.getExamBySlug(slug).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.loadSkills(exam.id);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load exam');
        this.isLoading.set(false);
      }
    });
  }

  private loadSkills(examId: string): void {
    this.examService.getExamSkills(examId).subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.isLoading.set(false);
      },
      error: () => {
        // Skills are optional, don't show error
        this.isLoading.set(false);
      }
    });
  }

  protected startTest(): void {
    if (this.isStarting()) return; // Prevent double click

    const user = this.authService.currentUser();
    const examData = this.exam();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!examData) return;

    this.isStarting.set(true);

    // Prepare request
    const request: any = { examId: examData.id };
    if (this.isPracticeMode()) {
      request.selectedSkills = Array.from(this.selectedSkills());
    }

    this.testAttemptService.startTest(request, user.id).subscribe({
      next: (attempt) => {
        // Check if this is an existing attempt (started more than 10 seconds ago)
        const startedAt = new Date(attempt.startedAt).getTime();
        const now = Date.now();
        const isExisting = (now - startedAt) > 10000; // 10 seconds buffer

        // If status is Pending (managed by us) or InProgress (from before) AND it's old enough to be a resume
        if (isExisting && (attempt.status === AttemptStatus.Pending || attempt.status === AttemptStatus.InProgress)) {
          this.pendingAttempt.set(attempt);
          this.showResumeModal.set(true);
          this.isStarting.set(false);
        } else {
          // New attempt or fresh start
          this.router.navigate(['/test', attempt.id]);
        }
      },
      error: (err) => {
        console.error('Failed to start test:', err);
        this.isStarting.set(false);
      }
    });
  }

  protected confirmResume(): void {
    const attempt = this.pendingAttempt();
    if (attempt) {
      this.router.navigate(['/test', attempt.id]);
    }
  }

  protected cancelResume(): void {
    this.showResumeModal.set(false);
    this.pendingAttempt.set(null);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  protected formatType(type: ExamType): string {
    switch (type) {
      case ExamType.IeltsAcademic:
        return 'IELTS Academic';
      case ExamType.IeltsGeneral:
        return 'IELTS General';
      case ExamType.Toeic:
        return 'TOEIC';
      default:
        return 'Other';
    }
  }

  protected getTypeClass(): string {
    switch (this.exam()?.type) {
      case ExamType.IeltsAcademic:
        return 'academic';
      case ExamType.IeltsGeneral:
        return 'general';
      default:
        return 'other';
    }
  }

  protected getSkillIcon(skill: SkillType): string {
    switch (skill) {
      case SkillType.Listening:
        return '🎧';
      case SkillType.Reading:
        return '📖';
      case SkillType.Writing:
        return '✍️';
      case SkillType.Speaking:
        return '🎤';
      default:
        return '📝';
    }
  }

  protected getTotalSections(): number {
    return this.skills().reduce((sum, s) => sum + s.sectionCount, 0);
  }
}
