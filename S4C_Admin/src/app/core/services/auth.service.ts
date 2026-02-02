import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/api.models';

export interface User {
    email: string;
    name: string;
    role: 'admin' | 'user'; // Or use UserRole from api models if matching
    avatar?: string;
    token?: string; // JWT token
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly STORAGE_KEY = 's4c_admin_user';
    // Use relative path to leverage proxy
    private readonly LOGIN_API = '/api/Auth/login';

    currentUser = signal<User | null>(null);

    constructor(
        private router: Router,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Initialize user from storage if in browser
        const user = this.getUserFromStorage();
        if (user) {
            this.currentUser.set(user);
        }
    }

    login(email: string, password: string): Observable<User> {
        const body: LoginRequest = { email, password };
        return this.http.post<LoginResponse>(this.LOGIN_API, body).pipe(
            map(response => {
                const user: User = {
                    email: response.user?.email || email,
                    name: response.user?.fullName || 'Admin User',
                    role: 'admin', // Enforce admin role for this portal
                    token: response.token,
                    avatar: 'assets/avatar-placeholder.png'
                };
                return user;
            }),
            tap(user => this.setCurrentUser(user))
        );
    }

    // Kept for backward compatibility if needed, but redirects to real login
    loginSafe(email: string, password: string): Observable<User> {
        return this.login(email, password);
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.STORAGE_KEY);
        }
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
    }

    isAuthenticated(): boolean {
        return !!this.currentUser();
    }

    private setCurrentUser(user: User): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        }
        this.currentUser.set(user);
    }

    private getUserFromStorage(): User | null {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        }
        return null;
    }
}
