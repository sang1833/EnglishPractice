import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterUserRequest, LoginResponse } from '../models';

const TOKEN_KEY = 's4c_auth_token';
const USER_KEY = 's4c_user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly api = inject(ApiService);
    private readonly router = inject(Router);

    // State signals
    private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
    private isLoadingSignal = signal(false);

    // Public readonly signals
    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

    /**
     * Register a new user
     */
    register(request: RegisterUserRequest): Observable<LoginResponse> {
        this.isLoadingSignal.set(true);
        return this.api.post<LoginResponse>('/Auth/register', request).pipe(
            tap((response) => {
                this.handleAuthSuccess(response);
            }),
            catchError((error) => {
                this.isLoadingSignal.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Login with email and password
     */
    login(request: LoginRequest): Observable<LoginResponse> {
        this.isLoadingSignal.set(true);
        return this.api.post<LoginResponse>('/Auth/login', request).pipe(
            tap((response) => {
                this.handleAuthSuccess(response);
            }),
            catchError((error) => {
                this.isLoadingSignal.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get current authenticated user info
     */
    getCurrentUser(): Observable<User> {
        return this.api.get<User>('/Auth/me').pipe(
            tap((user) => {
                this.currentUserSignal.set(user);
                this.saveUserToStorage(user);
            })
        );
    }

    /**
     * Logout and clear session
     */
    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.currentUserSignal.set(null);
        this.router.navigate(['/auth/login']);
    }

    /**
     * Check if user has a valid token
     */
    hasToken(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Get the current auth token
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Handle successful authentication
     */
    private handleAuthSuccess(response: LoginResponse): void {
        localStorage.setItem(TOKEN_KEY, response.token);
        this.saveUserToStorage(response.user);
        this.currentUserSignal.set(response.user);
        this.isLoadingSignal.set(false);
    }

    /**
     * Save user to localStorage
     */
    private saveUserToStorage(user: User): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    /**
     * Load user from localStorage
     */
    private loadUserFromStorage(): User | null {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
            try {
                return JSON.parse(stored) as User;
            } catch {
                return null;
            }
        }
        return null;
    }
}
