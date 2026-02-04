import { Component, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, ThemeSwitcherComponent, TranslateModule],
  template: `
    <header class="bg-surface shadow-[var(--shadow-sm)] sticky top-0 z-[888]">
      <div class="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16">
        <a routerLink="/dashboard" class="no-underline">
          <span class="text-2xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">Exam Practice</span>
        </a>

        <nav class="hidden md:flex gap-8">
          <a routerLink="/dashboard" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">{{ 'HEADER.DASHBOARD' | translate }}</a>
          <a routerLink="/history" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">{{ 'HEADER.HISTORY' | translate }}</a>
          <a routerLink="/statistics" class="text-muted hover:text-primary no-underline font-medium p-2 text-base transition-colors bg-transparent border-none cursor-pointer">{{ 'HEADER.STATISTICS' | translate }}</a>
        </nav>

        <div class="flex items-center gap-4">
          <!-- Language Switcher -->
          <div class="relative">
             <button 
              class="flex items-center gap-2 bg-transparent border border-border cursor-pointer p-2 rounded-md transition-colors hover:bg-surface-alt text-text" 
              (click)="toggleLangMenu()"
            >
              <span class="text-sm">{{ languageService.currentLang().toUpperCase() || "vi" }}</span>
              <span class="text-sm font-medium">{{ languageService.currentLang() === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
            </button>

            @if (langMenuOpen) {
              <div class="absolute top-full right-0 bg-surface border border-border rounded-lg shadow-lg min-w-[120px] py-2 mt-2 z-[999]">
                 <button class="flex items-center gap-3 w-full px-4 py-2 text-left bg-transparent border-none text-text hover:bg-surface-alt transition-colors cursor-pointer" (click)="setLang('en')">
                    <span class="text-lg">Tiếng Việt</span> 
                 </button>
                 <button class="flex items-center gap-3 w-full px-4 py-2 text-left bg-transparent border-none text-text hover:bg-surface-alt transition-colors cursor-pointer" (click)="setLang('vi')">
                    <span class="text-lg">English</span> 
                 </button>
              </div>
            }
          </div>

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
                  <a routerLink="/profile" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">{{ 'HEADER.PROFILE' | translate }}</a>
                  <a routerLink="/history" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">{{ 'HEADER.HISTORY' | translate }}</a>
                  <a routerLink="/statistics" class="block w-full px-4 py-3 text-left bg-transparent border-none text-text no-underline hover:bg-surface-alt transition-colors" (click)="closeMenu()">{{ 'HEADER.STATISTICS' | translate }}</a>
                  <hr class="my-2 border-t border-border" />
                  <button class="block w-full px-4 py-3 text-left bg-transparent border-none text-error hover:bg-surface-alt transition-colors cursor-pointer" (click)="logout()">
                    {{ 'HEADER.LOGOUT' | translate }}
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
          <a routerLink="/dashboard" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">{{ 'HEADER.DASHBOARD' | translate }}</a>
          <a routerLink="/history" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">{{ 'HEADER.HISTORY' | translate }}</a>
          <a routerLink="/statistics" class="text-muted hover:text-primary no-underline font-medium p-3 text-base transition-colors" (click)="closeMobileMenu()">{{ 'HEADER.STATISTICS' | translate }}</a>
          <hr class="my-2 border-t border-border" />
          <button class="w-full text-left bg-transparent border-none font-medium p-3 text-base text-error cursor-pointer" (click)="logout()">{{ 'HEADER.LOGOUT' | translate }}</button>
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
  protected readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected menuOpen = false;
  protected mobileMenuOpen = false;
  protected langMenuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.langMenuOpen = false;
  }

  toggleLangMenu(): void {
    this.langMenuOpen = !this.langMenuOpen;
    this.menuOpen = false;
  }

  setLang(lang: string): void {
    this.languageService.setLanguage(lang);
    this.langMenuOpen = false;
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
      this.langMenuOpen = false;
    }
  }
}
