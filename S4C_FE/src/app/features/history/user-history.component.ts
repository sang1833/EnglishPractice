import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TestAttemptService } from '../../core/services/test-attempt.service';
import { AuthService } from '../../core/services/auth.service';
import { TestAttemptListDto, PagedList, AttemptStatus } from '../../core/models';

@Component({
  selector: 'app-user-history',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  template: `
    <div class="pb-8">
      <div class="max-w-[800px] mx-auto px-4">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text m-0 mb-2">{{ 'HISTORY.TITLE' | translate }}</h1>
          <p class="text-text-muted m-0">{{ 'HISTORY.SUBTITLE' | translate }}</p>
        </header>

        <!-- Filters Section -->
        <section class="flex flex-wrap items-end gap-4 bg-surface p-6 rounded-lg mb-8 shadow-[var(--shadow-sm)]">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text">{{ 'HISTORY.FILTER_FROM' | translate }}</label>
            <input type="date" [(ngModel)]="fromDate" class="p-2 border border-border rounded-md text-sm min-w-[150px] bg-surface text-text" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text">{{ 'HISTORY.FILTER_TO' | translate }}</label>
            <input type="date" [(ngModel)]="toDate" class="p-2 border border-border rounded-md text-sm min-w-[150px] bg-surface text-text" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text">{{ 'HISTORY.SORT_BY' | translate }}</label>
            <select [(ngModel)]="sortOrder" class="p-2 border border-border rounded-md text-sm min-w-[150px] bg-surface text-text">
              <option value="desc">{{ 'HISTORY.NEWEST' | translate }}</option>
              <option value="asc">{{ 'HISTORY.OLDEST' | translate }}</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button class="inline-flex items-center justify-center py-2.5 px-5 rounded-md text-sm font-medium cursor-pointer transition-all border-none bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-[var(--shadow-hover)]" (click)="applyFilters()">{{ 'HISTORY.APPLY' | translate }}</button>
            <button class="inline-flex items-center justify-center py-2.5 px-5 rounded-md text-sm font-medium cursor-pointer transition-all border-none bg-surface-alt text-text hover:bg-border" (click)="resetFilters()">{{ 'HISTORY.RESET' | translate }}</button>
          </div>
        </section>

        @if (isLoading()) {
          <div class="text-center py-16 px-8 bg-surface rounded-lg">
            <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>{{ 'HISTORY.LOADING' | translate }}</p>
          </div>
        }

        @if (!isLoading()) {
          @if (attempts().length > 0) {
            <div class="flex flex-col gap-4">
              @for (attempt of attempts(); track attempt.id) {
                <article class="flex flex-wrap items-center gap-4 bg-surface rounded-lg p-5 shadow-[var(--shadow-sm)] transition-transform hover:translate-x-1">
                  <div class="flex-1 min-w-[200px]">
                    <h3 class="text-lg font-semibold text-text m-0 mb-2">
                      {{ attempt.examTitle }}
                      @if (isPractice(attempt)) {
                        <span class="inline-block bg-[var(--color-warning)] text-text-inverse text-xs py-0.5 px-2 rounded-full ml-3 font-semibold align-middle -translate-y-px">{{ 'HISTORY.PRACTICE_TAG' | translate }}</span>
                      }
                    </h3>
                    @if (isPractice(attempt)) {
                      <div class="flex flex-wrap gap-2 my-2">
                        @for (skill of getSkillList(attempt); track skill) {
                          <span class="bg-surface-alt text-text text-xs py-0.5 px-2 rounded-sm border border-border">{{ 'COMMON.SKILLS.' + skill.toUpperCase() | translate }}</span>
                        }
                      </div>
                    }
                    <div class="flex items-center gap-4 text-sm text-text-muted">
                      <span class="flex items-center gap-1">
                        📅 {{ formatDate(attempt.startedAt) }}
                      </span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                        [ngClass]="{
                          'bg-success/15 text-success': attempt.status === 'Completed',
                          'bg-[#ed8936]/15 text-[#c05621]': attempt.status === 'InProgress',
                          'bg-error/15 text-error': attempt.status === 'Abandoned'
                        }"
                      >
                        {{ formatStatus(attempt.status) | translate }}
                      </span>
                    </div>
                  </div>

                  @if (attempt.status === 'Completed' && attempt.overallScore !== undefined) {
                    <div class="flex flex-col items-center py-2 px-4 bg-[image:var(--gradient-primary)] rounded-md text-text-inverse">
                      <span class="text-[10px] uppercase tracking-widest opacity-90">{{ 'HISTORY.SCORE' | translate }}</span>
                      <span class="text-2xl font-bold">{{ attempt.overallScore.toFixed(1) }}</span>
                    </div>
                  }

                  <div class="flex gap-2">
                    @if (attempt.status === 'Completed') {
                      <a [routerLink]="['/result', attempt.id]" class="inline-flex items-center justify-center py-2.5 px-5 rounded-md text-sm font-medium no-underline cursor-pointer transition-all border-none bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-[var(--shadow-hover)]">
                        {{ 'HISTORY.VIEW_RESULT' | translate }}
                      </a>
                    } @else if (attempt.status === 'InProgress') {
                      <a [routerLink]="['/test', attempt.id]" class="inline-flex items-center justify-center py-2.5 px-5 rounded-md text-sm font-medium no-underline cursor-pointer transition-all border-none bg-surface-alt text-text hover:bg-border">
                        {{ 'HISTORY.CONTINUE' | translate }}
                      </a>
                    }
                  </div>
                </article>
              }
            </div>

            <!-- Pagination -->
            @if (pagination()) {
              <div class="flex items-center justify-center gap-4 mt-8">
                <button
                  class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer transition-all hover:enabled:border-primary hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="!pagination()!.hasPreviousPage"
                  (click)="loadPage(currentPage() - 1)"
                >
                  ← {{ 'COMMON.PREVIOUS' | translate }}
                </button>
                <span class="text-text-muted text-sm">
                  {{ 'COMMON.PAGE_OF' | translate:{current: currentPage(), total: pagination()!.totalPages} }}
                </span>
                <button
                  class="py-2 px-4 border border-border rounded-md bg-surface text-text font-medium cursor-pointer transition-all hover:enabled:border-primary hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="!pagination()!.hasNextPage"
                  (click)="loadPage(currentPage() + 1)"
                >
                  {{ 'COMMON.NEXT' | translate }} →
                </button>
              </div>
            }
          } @else {
            <div class="text-center py-16 px-8 bg-surface rounded-lg">
              <span class="text-6xl block mb-4">📝</span>
              <h3 class="text-text m-0 mb-2">{{ 'HISTORY.NO_TESTS' | translate }}</h3>
              <p class="text-text-muted mb-6">{{ 'HISTORY.NO_TESTS_SUB' | translate }}</p>
              <a routerLink="/dashboard" class="inline-flex items-center justify-center py-2.5 px-5 rounded-md text-sm font-medium no-underline cursor-pointer transition-all border-none bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-[var(--shadow-hover)]">
                {{ 'HISTORY.BROWSE_TESTS' | translate }}
              </a>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class UserHistoryComponent implements OnInit {
  private readonly testAttemptService = inject(TestAttemptService);
  private readonly authService = inject(AuthService);

  protected attempts = signal<TestAttemptListDto[]>([]);
  protected pagination = signal<PagedList<TestAttemptListDto> | null>(null);
  protected isLoading = signal(true);
  protected currentPage = signal(1);

  // Filter signals
  protected fromDate = signal<string>('');
  protected toDate = signal<string>('');
  protected sortOrder = signal<string>('desc');

  ngOnInit(): void {
    this.loadHistory();
  }

  protected applyFilters(): void {
    this.currentPage.set(1);
    this.loadHistory();
  }

  protected resetFilters(): void {
    this.fromDate.set('');
    this.toDate.set('');
    this.sortOrder.set('desc');
    this.applyFilters();
  }

  private loadHistory(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoading.set(true);

    this.testAttemptService.getUserAttempts(
      user.id,
      this.currentPage(),
      10,
      this.fromDate() ? new Date(this.fromDate()) : undefined,
      this.toDate() ? new Date(this.toDate()) : undefined,
      this.sortOrder()
    ).subscribe({
      next: (response) => {
        this.attempts.set(response.items);
        this.pagination.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected loadPage(page: number): void {
    this.currentPage.set(page);
    this.loadHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected isPractice(attempt: TestAttemptListDto): boolean {
    return !attempt.isFullTest;
  }

  protected getSkillList(attempt: TestAttemptListDto): string[] {
    if (!attempt.selectedSkills) return [];
    // Handle both array (if structure changed) and string cases, though DTO says string
    if (Array.isArray(attempt.selectedSkills)) return attempt.selectedSkills;
    return attempt.selectedSkills.split(',').map(s => s.trim());
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatStatus(status: AttemptStatus): string {
    switch (status) {
      case AttemptStatus.Completed: return 'HISTORY.STATUS.COMPLETED';
      case AttemptStatus.InProgress: return 'HISTORY.STATUS.IN_PROGRESS';
      case AttemptStatus.Abandoned: return 'HISTORY.STATUS.ABANDONED';
      default: return status;
    }
  }

  protected getStatusClass(status: AttemptStatus): string {
    switch (status) {
      case AttemptStatus.Completed: return 'completed';
      case AttemptStatus.InProgress: return 'in-progress';
      case AttemptStatus.Abandoned: return 'abandoned';
      default: return '';
    }
  }
}
