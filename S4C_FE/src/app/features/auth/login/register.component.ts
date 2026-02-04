import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="text-center">
      <h2 class="text-3xl font-semibold text-text mb-2">{{ 'AUTH.REGISTER_TITLE' | translate }}</h2>
      <p class="text-muted mb-6">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>

      @if (errorMessage()) {
        <div class="bg-error/10 text-error p-3 rounded-md mb-4 flex items-center gap-2 text-sm border border-error">
          <span class="text-lg">⚠️</span>
          {{ errorMessage() }}
        </div>
      }

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="text-left">
        <div class="mb-4">
          <label for="fullName" class="block font-medium text-text mb-2 text-sm">{{ 'AUTH.NAME_LABEL' | translate }}</label>
          <input
            type="text"
            id="fullName"
            formControlName="fullName"
            class="w-full p-3 border border-border rounded-md text-base transition-all bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Your full name"
            [class.border-error]="showFieldError('fullName')"
          />
          @if (showFieldError('fullName')) {
            <span class="block text-error text-xs mt-1">Full name is required</span>
          }
        </div>

        <div class="mb-4">
          <label for="email" class="block font-medium text-text mb-2 text-sm">{{ 'AUTH.EMAIL_LABEL' | translate }}</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full p-3 border border-border rounded-md text-base transition-all bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="you@example.com"
            [class.border-error]="showFieldError('email')"
          />
          @if (showFieldError('email')) {
            <span class="block text-error text-xs mt-1">Please enter a valid email address</span>
          }
        </div>

        <div class="mb-4">
          <label for="password" class="block font-medium text-text mb-2 text-sm">{{ 'AUTH.PASSWORD_LABEL' | translate }}</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="w-full p-3 border border-border rounded-md text-base transition-all bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="At least 6 characters"
            [class.border-error]="showFieldError('password')"
          />
          @if (showFieldError('password')) {
            <span class="block text-error text-xs mt-1">Password must be at least 6 characters</span>
          }
        </div>

        <div class="mb-4">
          <label for="confirmPassword" class="block font-medium text-text mb-2 text-sm">{{ 'AUTH.CONFIRM_PASSWORD_LABEL' | translate }}</label>
          <input
            type="password"
            id="confirmPassword"
            formControlName="confirmPassword"
            class="w-full p-3 border border-border rounded-md text-base transition-all bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Confirm your password"
            [class.border-error]="showFieldError('confirmPassword') || passwordMismatch()"
          />
          @if (passwordMismatch()) {
            <span class="block text-error text-xs mt-1">Passwords do not match</span>
          }
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border-none rounded-md text-base font-medium cursor-pointer transition-all w-full mt-2 bg-[image:var(--gradient-primary)] text-text-inverse hover:translate-y-[-1px] hover:shadow-[var(--shadow-hover)] disabled:opacity-70 disabled:cursor-not-allowed"
          [disabled]="authService.isLoading()"
        >
          @if (authService.isLoading()) {
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             {{ 'COMMON.LOADING' | translate }}
          } @else {
             {{ 'AUTH.SIGN_UP_BUTTON' | translate }}
          }
        </button>
      </form>

      <p class="mt-6 text-muted text-sm">
        {{ 'AUTH.HAVE_ACCOUNT' | translate }}
        <a routerLink="/auth/login" class="text-primary no-underline font-medium hover:underline">{{ 'AUTH.SIGN_IN_LINK' | translate }}</a>
      </p>
    </div>
  `
})
export class RegisterComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  protected errorMessage = signal<string | null>(null);

  protected showFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  protected passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    const confirmTouched = this.registerForm.get('confirmPassword')?.touched ?? false;
    return confirmTouched && password !== confirm;
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { fullName, email, password } = this.registerForm.value;

    this.authService.register({ fullName, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { message?: string }) => {
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
      }
    });
  }
}
