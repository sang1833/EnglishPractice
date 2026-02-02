import { User } from './auth.model';

/**
 * User Profile data
 * Mirrors User interface but can be extended
 */
export interface UserProfile extends User {
    phoneNumber?: string;
    dateOfBirth?: string;
}

/**
 * Request to update profile info
 */
export interface UpdateProfileRequest {
    fullName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
}

/**
 * Request to change password
 */
export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}
