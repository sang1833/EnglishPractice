import { Component, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme, THEME_OPTIONS } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        class="flex items-center gap-2 py-2 px-3 bg-surface-alt border border-border rounded-md text-text text-sm font-medium cursor-pointer transition-all hover:bg-surface hover:border-border-hover"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen"
        aria-label="Change theme"
      >
        <span class="text-base">{{ getCurrentIcon() }}</span>
        <span class="hidden sm:inline">{{ getCurrentLabel() }}</span>
        <span class="text-[0.625rem] transition-transform" [class.rotate-180]="isOpen">▼</span>
      </button>

      @if (isOpen) {
        <div 
          class="absolute top-[calc(100%+0.5rem)] right-0 min-w-[140px] bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-[999]" 
          (click)="$event.stopPropagation()"
        >
          @for (option of themeOptions; track option.value) {
            <button
              class="flex items-center gap-3 w-full py-3 px-4 bg-transparent border-none text-text text-sm cursor-pointer transition-colors hover:bg-surface-alt"
              [class.bg-primary-light]="isActive(option.value)"
              [class.text-primary]="isActive(option.value)"
              [class.font-medium]="isActive(option.value)"
              (click)="selectTheme(option.value)"
            >
              <span class="text-base">{{ option.icon }}</span>
              <span class="flex-1 text-left">{{ option.label }}</span>
              @if (isActive(option.value)) {
                <span class="text-primary font-semibold">✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);
  private readonly elementRef = inject(ElementRef);

  isOpen = false;
  themeOptions = THEME_OPTIONS;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.isOpen = false;
  }

  isActive(theme: Theme): boolean {
    return this.themeService.currentTheme() === theme;
  }

  getCurrentIcon(): string {
    const current = this.themeService.currentTheme();
    return this.themeOptions.find((o) => o.value === current)?.icon ?? '☀️';
  }

  getCurrentLabel(): string {
    const current = this.themeService.currentTheme();
    return this.themeOptions.find((o) => o.value === current)?.label ?? 'Light';
  }

  onDocumentClick(event: Event): void {
    if (
      event.target instanceof Node &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isOpen = false;
    }
  }
}
