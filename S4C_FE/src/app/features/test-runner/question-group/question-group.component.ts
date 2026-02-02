import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionGroup, SubmitAnswerRequest, QuestionType } from '../../../core/models';
import { ThemeService } from '../../../core/services/theme.service';
@Component({
  selector: 'app-question-group',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-surface rounded-lg p-6 mb-4 shadow-[var(--shadow-sm)]" [class.border-2]="isGameMode()" [class.border-border]="isGameMode()">
      <header class="mb-6 pb-4 border-b border-border">
        @if (group().title) {
          <h3 class="text-lg font-semibold text-text mb-2">{{ group().title }}</h3>
        }
        @if (group().instruction) {
          <p class="text-muted text-sm leading-relaxed m-0" [innerHTML]="group().instruction"></p>
        }
      </header>

      <div class="flex flex-col gap-6">
        @for (question of group().questions; track question.id; let i = $index) {
          <div class="flex gap-4">
            <span class="shrink-0 w-8 h-8 bg-[image:var(--gradient-primary)] text-text-inverse rounded-full flex items-center justify-center font-semibold text-sm">{{ question.orderIndex }}</span>
            <div class="flex-1">
              <p class="text-text leading-relaxed mb-4" [innerHTML]="question.content"></p>

              @switch (group().questionType) {
                @case ('MultipleChoice') {
                  <div class="flex flex-col gap-2">
                    @for (option of parseOptions(question.options); track option.key) {
                      <label 
                        class="flex items-center gap-3 p-3 px-4 bg-surface-alt rounded-md cursor-pointer transition-all border-2 border-transparent hover:bg-border"
                        [class.bg-primary-light]="getAnswer(question.id)?.selectedOptions === option.key"
                        [class.border-primary]="getAnswer(question.id)?.selectedOptions === option.key"
                        
                        [class.rounded-xl]="isGameMode()"
                        [class.border-b-4]="isGameMode()"
                        [class.border-border]="isGameMode() && getAnswer(question.id)?.selectedOptions !== option.key"
                        [class.hover:-translate-y-0.5]="isGameMode()"
                        [class.active:translate-y-0]="isGameMode()"
                        [class.active:border-b-2]="isGameMode()"
                        [class.active:mt-[2px]]="isGameMode()"
                        [class.border-b-primary-dark]="isGameMode() && getAnswer(question.id)?.selectedOptions === option.key"
                      >
                        <input
                          type="radio"
                          [name]="'q_' + question.id"
                          class="hidden"
                          [value]="option.key"
                          [checked]="getAnswer(question.id)?.selectedOptions === option.key"
                          (change)="onSelectOption(question.id, option.key)"
                        />
                        <span 
                          class="shrink-0 w-6 h-6 bg-border rounded-full flex items-center justify-center font-semibold text-xs text-text"
                          [class.bg-primary]="getAnswer(question.id)?.selectedOptions === option.key"
                          [class.text-text-inverse]="getAnswer(question.id)?.selectedOptions === option.key"
                        >{{ option.key }}</span>
                        <span class="text-text flex-1">{{ option.text }}</span>
                      </label>
                    }
                  </div>
                }
                @case ('TrueFalseNotGiven') {
                  <div class="flex flex-row flex-wrap gap-3">
                    @for (option of ['TRUE', 'FALSE', 'NOT GIVEN']; track option) {
                      <label 
                        class="flex items-center gap-3 p-2 px-4 bg-surface-alt rounded-md cursor-pointer transition-all border-2 border-transparent hover:bg-border"
                        [class.bg-primary-light]="getAnswer(question.id)?.selectedOptions === option"
                        [class.border-primary]="getAnswer(question.id)?.selectedOptions === option"

                        [class.rounded-xl]="isGameMode()"
                        [class.border-b-4]="isGameMode()"
                        [class.border-border]="isGameMode() && getAnswer(question.id)?.selectedOptions !== option"
                        [class.hover:-translate-y-0.5]="isGameMode()"
                        [class.active:translate-y-0]="isGameMode()"
                        [class.active:border-b-2]="isGameMode()"
                        [class.active:mt-[2px]]="isGameMode()"
                        [class.active:mt-[2px]]="isGameMode()"
                        [class.border-b-primary-dark]="isGameMode() && getAnswer(question.id)?.selectedOptions === option"
                      >
                        <input
                          type="radio"
                          [name]="'q_' + question.id"
                          class="hidden"
                          [value]="option"
                          [checked]="getAnswer(question.id)?.selectedOptions === option"
                          (change)="onSelectOption(question.id, option)"
                        />
                        <span class="text-text">{{ option }}</span>
                      </label>
                    }
                  </div>
                }
                @case ('FillInTheBlank') {
                  <input
                    type="text"
                    class="w-full p-3 border-2 border-border rounded-md text-base transition-colors bg-surface text-text focus:outline-none focus:border-primary"
                    [class.rounded-xl]="isGameMode()"
                    [class.p-4]="isGameMode()"
                    [class.shadow-inner]="isGameMode()"
                    [class.focus:ring-4]="isGameMode()"
                    [class.focus:ring-primary/20]="isGameMode()"
                    [value]="getAnswer(question.id)?.textContent || ''"
                    placeholder="Type your answer..."
                    (input)="onTextInput(question.id, $event)"
                  />
                }
                @case ('MatchingHeadings') {
                  <div class="flex flex-col gap-2">
                    @for (option of parseOptions(question.options); track option.key) {
                      <label 
                        class="flex items-center gap-3 p-3 px-4 bg-surface-alt rounded-md cursor-pointer transition-all border-2 border-transparent hover:bg-border"
                        [class.bg-primary-light]="getAnswer(question.id)?.selectedOptions === option.key"
                        [class.border-primary]="getAnswer(question.id)?.selectedOptions === option.key"

                        [class.rounded-xl]="isGameMode()"
                        [class.border-b-4]="isGameMode()"
                        [class.border-border]="isGameMode() && getAnswer(question.id)?.selectedOptions !== option.key"
                        [class.hover:-translate-y-0.5]="isGameMode()"
                        [class.active:translate-y-0]="isGameMode()"
                        [class.active:border-b-2]="isGameMode()"
                        [class.active:mt-[2px]]="isGameMode()"
                        [class.active:mt-[2px]]="isGameMode()"
                        [class.border-b-primary-dark]="isGameMode() && getAnswer(question.id)?.selectedOptions === option.key"
                      >
                        <input
                          type="radio"
                          [name]="'q_' + question.id"
                          class="hidden"
                          [value]="option.key"
                          [checked]="getAnswer(question.id)?.selectedOptions === option.key"
                          (change)="onSelectOption(question.id, option.key)"
                        />
                        <span 
                          class="shrink-0 w-6 h-6 bg-border rounded-full flex items-center justify-center font-semibold text-xs text-text"
                          [class.bg-primary]="getAnswer(question.id)?.selectedOptions === option.key"
                          [class.text-text-inverse]="getAnswer(question.id)?.selectedOptions === option.key"
                        >{{ option.key }}</span>
                        <span class="text-text flex-1">{{ option.text }}</span>
                      </label>
                    }
                  </div>
                }
                @case ('DropDown') {
                  <select
                    class="w-full p-3 border-2 border-border rounded-md text-base bg-surface text-text cursor-pointer focus:outline-none focus:border-primary"
                    [class.rounded-xl]="isGameMode()"
                    [class.shadow-inner]="isGameMode()"
                    [class.focus:ring-4]="isGameMode()"
                    [class.focus:ring-primary/20]="isGameMode()"
                    [value]="getAnswer(question.id)?.selectedOptions || ''"
                    (change)="onDropdownChange(question.id, $event)"
                  >
                    <option value="" disabled>Select an answer...</option>
                    @for (option of parseOptions(question.options); track option.key) {
                      <option [value]="option.key">{{ option.key }}. {{ option.text }}</option>
                    }
                  </select>
                }
                @default {
                  <input
                    type="text"
                    class="w-full p-3 border-2 border-border rounded-md text-base transition-colors bg-surface text-text focus:outline-none focus:border-primary"
                    [class.rounded-xl]="isGameMode()"
                    [class.p-4]="isGameMode()"
                    [class.shadow-inner]="isGameMode()"
                    [class.focus:ring-4]="isGameMode()"
                    [class.focus:ring-primary/20]="isGameMode()"
                    [value]="getAnswer(question.id)?.textContent || ''"
                    placeholder="Type your answer..."
                    (input)="onTextInput(question.id, $event)"
                  />
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class QuestionGroupComponent {
  private readonly themeService = inject(ThemeService);

  group = input.required<QuestionGroup>();
  answers = input.required<Map<string, SubmitAnswerRequest>>();
  answerChange = output<SubmitAnswerRequest>();

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected getAnswer(questionId: string): SubmitAnswerRequest | undefined {
    return this.answers().get(questionId);
  }

  protected getOptionState(questionId: string, value: string): string {
    if (!this.isGameMode()) return 'idle';
    const answer = this.getAnswer(questionId);
    return answer?.selectedOptions === value ? 'active' : 'idle';
  }

  protected parseOptions(optionsJson?: string): Array<{ key: string; text: string }> {
    if (!optionsJson) return [];
    try {
      const parsed = JSON.parse(optionsJson);
      if (Array.isArray(parsed)) {
        return parsed.map((opt, i) => ({
          key: typeof opt === 'object' ? opt.key : String.fromCharCode(65 + i),
          text: typeof opt === 'object' ? opt.text : opt
        }));
      }
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, text]) => ({ key, text: String(text) }));
      }
    } catch {
      // If not valid JSON, treat as simple text options
    }
    return [];
  }

  protected onSelectOption(questionId: string, value: string): void {
    this.answerChange.emit({
      questionId,
      selectedOptions: value
    });
  }

  protected onTextInput(questionId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.answerChange.emit({
      questionId,
      textContent: input.value
    });
  }

  protected onDropdownChange(questionId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.answerChange.emit({
      questionId,
      selectedOptions: select.value
    });
  }
}
