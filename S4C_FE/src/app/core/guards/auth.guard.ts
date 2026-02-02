import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasToken()) {
        return true;
    }

    // Redirect to login page
    router.navigate(['/auth/login']);
    return false;
};

/**
 * Guard to prevent authenticated users from accessing auth pages
 */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasToken()) {
        return true;
    }

    // Redirect to dashboard if already logged in
    router.navigate(['/dashboard']);
    return false;
};
