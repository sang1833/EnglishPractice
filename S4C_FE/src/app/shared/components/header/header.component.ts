import { Component, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, ThemeSwitcherComponent],
  template: `
    <header class="bg-surface shadow-[var(--shadow-sm)] sticky top-0 z-[888]">
      <div class="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16">
        <a routerLink="/dashboard" class="no-underline">
          <span class="text-2xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">Exam Practice</span>
        </a>

        <nav class="hidden md:flex gap-8">
          <a routerLink="/dashboard" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">Dashboard</a>
          <a routerLink="/history" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">My Tests</a>
          <a routerLink="/statistics" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">Statistics</a>
        </nav>

        <div class="flex items-center gap-4">
          <!-- Theme Switcher -->
          <app-theme-switcher />

          @if (authService.currentUser(); as user) {
            <div class="relative hidden md:block">
              <button 
                class="flex items-center gap-2 bg-transparent border-none cursor-pointer p-2 rounded-md transition-colors hover:bg-surface-alt" 
                (click)="toggleMenu()"
              >
                <!-- Avatar -->
                <span class="w-8 h-8 bg-[image:var(--gradient-primary)] text-text-inverse rounded-full flex items-center justify-center font-semibold text-sm">
                  {{ user.fullName.charAt(0) }}
                </span>
                <span class="text-text font-medium">{{ user.fullName }}</span>
                <span class="text-[0.625rem] text-muted">▼</span>
              </button>

              @if (menuOpen) {
                <div class="absolute top-full right-0 bg-surface border border-border rounded-lg shadow-lg min-w-[180px] py-2 mt-2 z-[999]">
                  <a routerLink="/profile" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">Profile</a>
                  <a routerLink="/history" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">My Tests</a>
                  <a routerLink="/statistics" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">Statistics</a>
                  <hr class="my-2 border-t border-border" />
                  <button class="block w-full px-4 py-3 text-left bg-transparent border-none text-error hover:bg-surface-alt transition-colors cursor-pointer" (click)="logout()">
                    Logout
                  </button>
                </div>
              }
            </div>
          }

          <!-- Mobile menu button -->
          <button class="md:hidden flex items-center justify-center bg-transparent border-none cursor-pointer p-2 text-2xl text-text" (click)="toggleMobileMenu()">
            ☰
          </button>
        </div>
      </div>

      <!-- Mobile navigation -->
      @if (mobileMenuOpen) {
        <nav class="md:hidden flex flex-col p-4 border-t border-border bg-surface">
          <a routerLink="/dashboard" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">Dashboard</a>
          <a routerLink="/history" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">My Tests</a>
          <a routerLink="/statistics" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">Statistics</a>
          <hr class="my-2 border-t border-border" />
          <button class="w-full text-left bg-transparent border-none font-medium p-3 text-base text-error cursor-pointer" (click)="logout()">Logout</button>
        </nav>
      }
    </header>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected menuOpen = false;
  protected mobileMenuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    this.authService.logout();
  }

  onDocumentClick(event: Event): void {
    if (
      event.target instanceof Node &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.menuOpen = false;
      this.mobileMenuOpen = false;
    }
  }
}
