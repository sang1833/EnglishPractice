import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ExamListDto, ExamType } from '../../../core/models';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-exam-card',
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <article 
      class="block bg-surface rounded-xl overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg-theme)]"
      [class.animate-pulse-scale]="isHovered() && isGameMode()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <div class="relative h-40 bg-[image:var(--gradient-primary)]">
        @if (exam().thumbnailUrl) {
          <img [src]="exam().thumbnailUrl" [alt]="exam().title" class="w-full h-full object-cover" />
        } @else {
          <div class="w-full h-full flex items-center justify-center">
            <span 
              class="text-5xl opacity-50 transition-transform duration-300"
              [class.animate-bounce]="isHovered() && isGameMode()"
            >📝</span>
          </div>
        }
        <span 
          class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
          [ngClass]="{
            'bg-[#667eea]/90': exam().type === 'IeltsAcademic',
            'bg-[#48bb78]/90': exam().type === 'IeltsGeneral',
            'bg-gray-400/90': exam().type !== 'IeltsAcademic' && exam().type !== 'IeltsGeneral'
          }"
        >
          {{ getExamTypeKey(exam().type) | translate }}
        </span>
      </div>

      <div class="p-5">
        <h3 class="text-lg font-semibold text-text mb-3 leading-snug">{{ exam().title }}</h3>

        <div class="flex gap-4 mb-4 text-muted text-sm">
          <span class="flex items-center gap-1">
            <span>⏱️</span>
            {{ exam().duration }} {{ 'COMMON.MINS' | translate }}
          </span>
        </div>

        <div class="flex gap-2">
          <a
            [routerLink]="['/exam', exam().slug]"
            class="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-center cursor-pointer transition-all border-none no-underline bg-[image:var(--gradient-primary)] text-text-inverse hover:shadow-[var(--shadow-hover)]"
            [class.hover:scale-105]="isGameMode()"
            [class.active:scale-95]="isGameMode()"
          >
            {{ 'DASHBOARD.VIEW_DETAILS' | translate }}
          </a>
          <button
            class="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-center cursor-pointer transition-all border-none bg-surface-alt text-text hover:bg-border"
            [class.hover:scale-105]="isGameMode()"
            [class.active:scale-95]="isGameMode()"
            (click)="onStartTest()"
          >
            {{ 'DASHBOARD.START_NOW' | translate }}
          </button>
        </div>
      </div>
    </article>
  `
})
export class ExamCardComponent {
  private readonly themeService = inject(ThemeService);

  exam = input.required<ExamListDto>();
  startTest = output<string>();

  protected isHovered = signal(false);

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected onMouseEnter(): void {
    this.isHovered.set(true);
  }

  protected onMouseLeave(): void {
    this.isHovered.set(false);
  }

  protected getExamTypeKey(type: ExamType): string {
    switch (type) {
      case ExamType.IeltsAcademic:
        return 'COMMON.EXAM_TYPE.ACADEMIC';
      case ExamType.IeltsGeneral:
        return 'COMMON.EXAM_TYPE.GENERAL';
      case ExamType.Toeic:
        return 'COMMON.EXAM_TYPE.TOEIC';
      default:
        return 'COMMON.EXAM_TYPE.OTHER';
    }
  }

  protected onStartTest(): void {
    this.startTest.emit(this.exam().id);
  }
}
