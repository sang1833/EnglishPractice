import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="text-center">
      <h2 class="text-3xl font-semibold text-text mb-2">Welcome Back</h2>
      <p class="text-muted mb-6">Sign in to continue to your account</p>

      @if (errorMessage()) {
        <div class="bg-error/10 text-error p-3 rounded-md mb-4 flex items-center gap-2 text-sm border border-error">
          <span class="text-lg">⚠️</span>
          {{ errorMessage() }}
        </div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="text-left">
        <div class="mb-5">
          <label for="email" class="block font-medium text-text mb-2 text-sm">Email</label>
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

        <div class="mb-5">
          <label for="password" class="block font-medium text-text mb-2 text-sm">Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="w-full p-3 border border-border rounded-md text-base transition-all bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Enter your password"
            [class.border-error]="showFieldError('password')"
          />
          @if (showFieldError('password')) {
            <span class="block text-error text-xs mt-1">Password is required</span>
          }
        </div>

        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border-none rounded-md text-base font-medium cursor-pointer transition-all w-full mt-2 bg-[image:var(--gradient-primary)] text-text-inverse hover:translate-y-[-1px] hover:shadow-[var(--shadow-hover)] disabled:opacity-70 disabled:cursor-not-allowed"
          [disabled]="authService.isLoading()"
        >
          @if (authService.isLoading()) {
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Signing in...
          } @else {
            Sign In
          }
        </button>
      </form>

      <p class="mt-6 text-muted text-sm">
        Don't have an account?
        <a routerLink="/auth/register" class="text-primary no-underline font-medium hover:underline">Create one</a>
      </p>
    </div>
  `
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected errorMessage = signal<string | null>(null);

  protected showFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { message?: string }) => {
        this.errorMessage.set(err.message || 'Login failed. Please try again.');
      }
    });
  }
}
