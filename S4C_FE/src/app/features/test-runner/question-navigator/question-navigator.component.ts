import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

interface FlatQuestion {
  question: { id: string };
  globalIndex: number;
}

@Component({
  selector: 'app-question-navigator',
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <h3 class="text-base font-semibold text-text mb-4 pb-3 border-b border-border">Questions</h3>
      <div class="grid grid-cols-5 gap-1 flex-1 overflow-y-auto pb-4 content-start">
        @for (q of questions(); track q.question.id; let i = $index) {
          <button
            class="flex items-center justify-center border-2 border-border rounded-md bg-surface text-text-muted font-medium text-xs cursor-pointer transition-all aspect-square hover:border-primary hover:text-primary"
            [class.bg-success]="answeredIds().has(q.question.id)"
            [class.border-success]="answeredIds().has(q.question.id)"
            [class.text-text-inverse]="answeredIds().has(q.question.id)"
            
            [class.border-primary]="currentIndex() === i"
            [class.shadow-[0_0_0_3px_rgba(102,126,234,0.2)]]="currentIndex() === i"
            
            [class.rounded-full]="isGameMode()"
            [class.font-bold]="isGameMode()"
            [class.shadow-[0_2px_0_rgba(72,187,120,0.5)]]="isGameMode() && answeredIds().has(q.question.id)"
            [class.-translate-y-px]="isGameMode() && answeredIds().has(q.question.id)"
            [class.active:translate-y-px]="isGameMode()"
            [class.active:shadow-none]="isGameMode()"
            
            [class.active:shadow-none]="isGameMode()"
            
            (click)="navigate.emit(i)"
          >
            {{ i + 1 }}
          </button>
        }
      </div>

      <div class="pt-4 border-t border-border flex flex-col gap-2">
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span 
            class="w-4 h-4 rounded border-2 border-success bg-success"
            [class.rounded-full]="isGameMode()"
            [class.animate-pulse]="isGameMode()"
          ></span>
          <span>Answered</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span 
            class="w-4 h-4 rounded border-2 border-border bg-surface"
            [class.rounded-full]="isGameMode()"
          ></span>
          <span>Unanswered</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span 
            class="w-4 h-4 rounded border-2 border-primary bg-surface shadow-[0_0_0_2px_rgba(102,126,234,0.2)]"
            [class.rounded-full]="isGameMode()"
            [class.animate-pulse]="isGameMode()"
          ></span>
          <span>Current</span>
        </div>
      </div>
    </div>
  `
})
export class QuestionNavigatorComponent {
  private readonly themeService = inject(ThemeService);

  questions = input.required<FlatQuestion[]>();
  answeredIds = input.required<Set<string>>();
  currentIndex = input.required<number>();
  navigate = output<number>();

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }


}
