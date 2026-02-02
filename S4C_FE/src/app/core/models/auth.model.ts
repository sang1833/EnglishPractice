import { UserRole } from './common.model';

/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Register request payload
 */
export interface RegisterUserRequest {
    email: string;
    password: string;
    fullName: string;
}

/**
 * Login response with JWT token
 */
export interface LoginResponse {
    token: string;
    user: User;
}

/**
 * Current user response from /api/auth/me
 */
export interface CurrentUserResponse {
    user: User;
}
