import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../models/profile.models';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private readonly http = inject(HttpClient);
    private readonly profileUrl = `${environment.apiUrl}/Profile`;
    private readonly authUrl = `${environment.apiUrl}/Auth`;

    /**
     * Get current user profile
     */
    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(this.profileUrl);
    }

    /**
     * Update user profile information
     */
    updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
        return this.http.put<UserProfile>(this.profileUrl, request);
    }

    /**
     * Change user password
     */
    changePassword(request: ChangePasswordRequest): Observable<void> {
        return this.http.post<void>(`${this.authUrl}/change-password`, request);
    }
}
