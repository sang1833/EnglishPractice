import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ExamService } from '../../../core/services/exam.service';
import { TestAttemptService } from '../../../core/services/test-attempt.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExamListDto, PagedList, ExamType, ExamStatus } from '../../../core/models';
import { ExamCardComponent } from '../exam-card/exam-card.component';

@Component({
  selector: 'app-exam-list',
  imports: [CommonModule, FormsModule, ExamCardComponent, TranslateModule],
  template: `
    <div class="pb-8" [class.game-mode]="isGameMode()">
      <div class="max-w-[1200px] mx-auto px-4">
        <header class="mb-8">
          <div class="header-content">
            <h1 class="text-3xl md:text-4xl font-bold text-text mb-2">
              @if (isGameMode()) {
                {{ 'DASHBOARD.TITLE_GAME' | translate }}
              } @else {
               {{ 'DASHBOARD.TITLE' | translate }}
              }
            </h1>
            <p class="text-muted m-0">
              {{ 'DASHBOARD.SUBTITLE' | translate }}
            </p>
          </div>
        </header>

        <!-- Filters -->
        <div 
          class="flex flex-wrap gap-4 mb-8 p-4 bg-surface rounded-lg shadow-[var(--shadow-sm)]"
          [class.rounded-xl]="isGameMode()"
          [class.border-2]="isGameMode()"
          [class.border-border]="isGameMode()"
        >
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-muted uppercase tracking-wider">{{ 'COMMON.TYPE' | translate }}</label>
            <select
              class="py-2.5 px-3.5 border border-border rounded-md text-sm bg-surface text-text transition-colors focus:outline-none focus:border-primary"
              [class.border-2]="isGameMode()"
              [class.rounded-lg]="isGameMode()"
              [(ngModel)]="selectedType"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">{{ 'COMMON.ALL_TYPES' | translate }}</option>
              <option [value]="'IeltsAcademic'">IELTS Academic</option>
              <option [value]="'IeltsGeneral'">IELTS General</option>
              <option [value]="'Toeic'">TOEIC</option>
            </select>
          </div>

          <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label class="text-xs font-semibold text-muted uppercase tracking-wider">{{ 'COMMON.SEARCH' | translate }}</label>
            <input
              type="text"
              class="py-2.5 px-3.5 border border-border rounded-md text-sm bg-surface text-text transition-colors focus:outline-none focus:border-primary"
              [class.border-2]="isGameMode()"
              [class.rounded-lg]="isGameMode()"
              [placeholder]="'DASHBOARD.SEARCH_PLACEHOLDER' | translate"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
            />
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="text-center py-16 px-8 bg-surface rounded-lg">
            <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>{{ 'COMMON.LOADING_EXAMS' | translate }}</p>
          </div>
        }

        <!-- Error State -->
        @if (errorMessage()) {
          <div class="text-center py-16 px-8 bg-surface rounded-lg">
            <p class="text-error mb-4">{{ errorMessage() }}</p>
            <button class="py-3 px-6 rounded-md border-none font-medium cursor-pointer transition-all bg-[image:var(--gradient-primary)] text-text-inverse" (click)="loadExams()">{{ 'COMMON.TRY_AGAIN' | translate }}</button>
          </div>
        }

        <!-- Exam Grid -->
        @if (!isLoading() && !errorMessage()) {
          @if (exams().length > 0) {
            <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              @for (exam of exams(); track exam.id) {
                <app-exam-card
                  [exam]="exam"
                  (startTest)="onStartTest($event)"
                />
              }
            </div>

            <!-- Pagination -->
            @if (pagination()) {
              <div class="flex items-center justify-center gap-4 mt-8 p-4 rounded-lg bg-surface">
                <button
                  class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer transition-all hover:enabled:border-primary hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  [class.border-2]="isGameMode()"
                  [class.rounded-lg]="isGameMode()"
                  [disabled]="!pagination()!.hasPreviousPage"
                  (click)="onPageChange(currentPage() - 1)"
                >
                  ← {{ 'COMMON.PREVIOUS' | translate }}
                </button>
                <span class="text-muted text-sm">
                   {{ 'COMMON.PAGE_OF' | translate:{current: currentPage(), total: pagination()!.totalPages} }}
                </span>
                <button
                  class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer transition-all hover:enabled:border-primary hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  [class.border-2]="isGameMode()"
                  [class.rounded-lg]="isGameMode()"
                  [disabled]="!pagination()!.hasNextPage"
                  (click)="onPageChange(currentPage() + 1)"
                >
                  {{ 'COMMON.NEXT' | translate }} →
                </button>
              </div>
            }
          } @else {
            <div class="text-center py-16 px-8 bg-surface rounded-lg text-muted">
              <span class="text-6xl block mb-4">📚</span>
              <h3 class="text-text m-0 mb-2">{{ 'DASHBOARD.NO_EXAMS' | translate }}</h3>
              <p>{{ 'DASHBOARD.NO_EXAMS_SUB' | translate }}</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ExamListComponent implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly testAttemptService = inject(TestAttemptService);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  // State signals
  protected exams = signal<ExamListDto[]>([]);
  protected pagination = signal<PagedList<ExamListDto> | null>(null);
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected currentPage = signal(1);

  // Filter values
  protected selectedType: ExamType | null = null;
  protected searchQuery = '';
  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadExams();
  }

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected loadExams(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.examService.getExams({
      page: this.currentPage(),
      pageSize: 12,
      type: this.selectedType || undefined,
      status: ExamStatus.Published,
      search: this.searchQuery || undefined
    }).subscribe({
      next: (response) => {
        this.exams.set(response.items);
        this.pagination.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load exams');
        this.isLoading.set(false);
      }
    });
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadExams();
  }

  protected onSearchChange(): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadExams();
    }, 300);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadExams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected onStartTest(examId: string): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.testAttemptService.startTest({ examId }, user.id).subscribe({
      next: (attempt) => {
        this.router.navigate(['/test', attempt.id]);
      },
      error: (err) => {
        console.error('Failed to start test:', err);
        // Show error toast (to be implemented)
      }
    });
  }
}
