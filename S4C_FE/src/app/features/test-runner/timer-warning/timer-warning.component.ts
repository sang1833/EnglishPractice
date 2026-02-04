import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';


@Component({
  selector: 'app-timer-warning',
  imports: [CommonModule, TranslateModule],
  template: `
    @if (visible()) {
      <div 
        class="fixed top-20 right-4 z-[1000] transition-transform duration-300" 
        [class.border-4]="isGameMode()"
        [class.border-white]="isGameMode()"
        [class.animate-shake]="getShakeState() === 'shake'"
      >
        <div 
          class="flex items-center gap-3 bg-gradient-to-br from-error to-[#c53030] text-text-inverse py-4 px-5 rounded-lg shadow-[0_10px_40px_rgba(197,48,48,0.4)] min-w-[280px]"
          [class.animate-pulse]="isCritical() && isGameMode()"
          [class.rounded-xl]="isGameMode()"
          [class.shadow-[0_10px_0_rgba(197,48,48,0.2)]]="isGameMode()"
        >
          <span class="text-2xl" [class.animate-bounce]="isGameMode()">⚠️</span>
          <div class="flex-1 flex flex-col gap-1">
            <strong class="text-sm">{{ 'TEST.TIME_RUNNING_OUT' | translate }}</strong>
            <span class="text-xs opacity-90">{{ 'TEST.TIME_REMAINING_MSG' | translate:{time: formatTime(timeRemaining())} }}</span>
          </div>
          <button 
            class="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 border-none text-text-inverse text-xl cursor-pointer transition-colors hover:bg-white/30"
            (click)="dismiss.emit()"
          >×</button>
        </div>
      </div>
    }
  `
})
export class TimerWarningComponent {
  private readonly themeService = inject(ThemeService);

  visible = input.required<boolean>();
  timeRemaining = input.required<number>();
  dismiss = output<void>();

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  // Critical if less than 1 minute
  protected isCritical(): boolean {
    return this.timeRemaining() < 60;
  }

  protected getShakeState(): string {
    if (!this.isGameMode() || !this.visible()) return 'idle';
    return 'shake';
  }

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
