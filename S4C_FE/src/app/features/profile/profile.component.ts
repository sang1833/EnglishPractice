import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../core/models/profile.models';

type TabType = 'general' | 'security';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-8 px-4 pb-16 min-h-screen bg-background" [class.game-mode]="isGameMode()">
      <div class="max-w-[1000px] mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text m-0 mb-2">
            @if (isGameMode()) {
               👤 Character Sheet
            } @else {
               User Profile
            }
          </h1>
          <p class="text-text-muted m-0">Manage your account settings and preferences</p>
        </header>

        <div class="flex flex-col gap-8">
          <!-- Horizontal Tabs -->
          <nav class="flex flex-row overflow-x-auto gap-2 border-b border-border pb-1">
            <button 
              class="whitespace-nowrap py-2 px-4 rounded-t-lg bg-transparent cursor-pointer transition-colors font-medium flex items-center gap-2 border-b-2"
              [class.border-primary]="activeTab() === 'general' && !isGameMode()"
              [class.text-primary]="activeTab() === 'general' && !isGameMode()"
              [class.border-transparent]="activeTab() !== 'general' && !isGameMode()"
              [class.text-text-muted]="activeTab() !== 'general' && !isGameMode()"
              [class.hover:text-text]="activeTab() !== 'general' && !isGameMode()"
              
              [class.bg-surface]="isGameMode()"
              [class.border-2]="isGameMode()"
              [class.border-b-0]="isGameMode()"
              [class.translate-y-1]="isGameMode() && activeTab() === 'general'"
              [class.z-10]="isGameMode() && activeTab() === 'general'"
              [class.border-primary]="isGameMode() && activeTab() === 'general'"
              (click)="setActiveTab('general')"
            >
              <span>📝</span> General Info
            </button>
            <button 
              class="whitespace-nowrap py-2 px-4 rounded-t-lg bg-transparent cursor-pointer transition-colors font-medium flex items-center gap-2 border-b-2"
              [class.border-primary]="activeTab() === 'security' && !isGameMode()"
              [class.text-primary]="activeTab() === 'security' && !isGameMode()"
              [class.border-transparent]="activeTab() !== 'security' && !isGameMode()"
              [class.text-text-muted]="activeTab() !== 'security' && !isGameMode()"
              [class.hover:text-text]="activeTab() !== 'security' && !isGameMode()"

              [class.bg-surface]="isGameMode()"
              [class.border-2]="isGameMode()"
              [class.border-b-0]="isGameMode()"
              [class.translate-y-1]="isGameMode() && activeTab() === 'security'"
              [class.z-10]="isGameMode() && activeTab() === 'security'"
              [class.border-primary]="isGameMode() && activeTab() === 'security'"
              (click)="setActiveTab('security')"
            >
              <span>🔒</span> Password
            </button>
          </nav>

          <!-- Content -->
          <main class="bg-surface rounded-xl p-6 shadow-[var(--shadow-sm)] border border-border/50 min-h-[400px]">
            @if (isLoading()) {
              <div class="flex flex-col items-center justify-center h-full py-12">
                <div class="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
                <p class="text-text-muted">Loading profile...</p>
              </div>
            } @else {
              @if (activeTab() === 'general') {
                <section class="animate-fade-in">
                  <h2 class="text-xl font-bold text-text mb-6">General Information</h2>
                  
                  <div class="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <!-- Avatar section -->
                    <div class="flex flex-col items-center gap-4">
                      <div class="w-32 h-32 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-4xl font-bold text-text-inverse shadow-inner">
                        {{ userProfile()?.fullName?.charAt(0) || 'U' }}
                      </div>
                      <!-- Add avatar upload button here in future -->
                    </div>

                    <!-- Form -->
                    <div class="flex-1 w-full max-w-md flex flex-col gap-4">
                      <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-text-muted">Email Address</label>
                        <input 
                          type="email" 
                          [value]="userProfile()?.email" 
                          disabled
                          class="p-2.5 rounded-md border border-border bg-surface-alt text-text-muted cursor-not-allowed opacity-75"
                        >
                      </div>

                      <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-text">Full Name</label>
                        <input 
                          type="text" 
                          class="p-2.5 rounded-md border border-border bg-surface text-text focus:border-primary focus:outline-none transition-colors"
                          [(ngModel)]="editForm.fullName"
                          placeholder="Enter your full name"
                        >
                      </div>

                      <div class="mt-4">
                        <button 
                          class="py-2.5 px-6 rounded-md font-medium text-text-inverse bg-[image:var(--gradient-primary)] border-none cursor-pointer hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          (click)="updateProfile()"
                          [disabled]="isSaving()"
                          [class.hover:-translate-y-0.5]="!isSaving()"
                        >
                          {{ isSaving() ? 'Saving...' : 'Save Changes' }}
                        </button>
                        
                        @if (updateMessage()) {
                          <span class="ml-4 text-sm" [class.text-success]="!updateError()" [class.text-error]="updateError()">
                            {{ updateMessage() }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </section>
              } @else if (activeTab() === 'security') {
                <section class="animate-fade-in">
                  <h2 class="text-xl font-bold text-text mb-6">Password Settings</h2>
                  
                  <div class="w-full max-w-md flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                      <label class="text-sm font-medium text-text">Current Password</label>
                      <input 
                        type="password" 
                        class="p-2.5 rounded-md border border-border bg-surface text-text focus:border-primary focus:outline-none transition-colors"
                        [(ngModel)]="passwordForm.currentPassword"
                        placeholder="••••••••"
                      >
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-sm font-medium text-text">New Password</label>
                      <input 
                        type="password" 
                        class="p-2.5 rounded-md border border-border bg-surface text-text focus:border-primary focus:outline-none transition-colors"
                        [(ngModel)]="passwordForm.newPassword"
                        placeholder="••••••••"
                      >
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-sm font-medium text-text">Confirm New Password</label>
                      <input 
                        type="password" 
                        class="p-2.5 rounded-md border border-border bg-surface text-text focus:border-primary focus:outline-none transition-colors"
                        [(ngModel)]="passwordForm.confirmNewPassword"
                        placeholder="••••••••"
                      >
                    </div>

                    <div class="mt-4">
                      <button 
                        class="py-2.5 px-6 rounded-md font-medium text-text-inverse bg-[image:var(--gradient-primary)] border-none cursor-pointer hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        (click)="changePassword()"
                        [disabled]="isSaving() || !isPasswordFormValid()"
                        [class.hover:-translate-y-0.5]="!isSaving() && isPasswordFormValid()"
                      >
                        {{ isSaving() ? 'Updating...' : 'Change Password' }}
                      </button>

                      @if (passwordMessage()) {
                        <p class="mt-2 text-sm" [class.text-success]="!passwordError()" [class.text-error]="passwordError()">
                          {{ passwordMessage() }}
                        </p>
                      }
                    </div>
                  </div>
                </section>
              }
            }
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  // State
  protected activeTab = signal<TabType>('general');
  protected isLoading = signal(false);
  protected isSaving = signal(false);
  protected userProfile = signal<UserProfile | null>(null);

  // Form Data
  protected editForm: UpdateProfileRequest = {
    fullName: ''
  };

  protected passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  // Messages
  protected updateMessage = signal('');
  protected updateError = signal(false);
  protected passwordMessage = signal('');
  protected passwordError = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  protected isGameMode(): boolean {
    return this.themeService.isGameTheme();
  }

  protected setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
    // Clear messages when switching tabs
    this.updateMessage.set('');
    this.passwordMessage.set('');
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.editForm = {
          fullName: profile.fullName
        };
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading.set(false);
      }
    });
  }

  protected updateProfile(): void {
    if (!this.editForm.fullName.trim()) return;

    this.isSaving.set(true);
    this.updateMessage.set('');

    this.profileService.updateProfile(this.editForm).subscribe({
      next: (updatedProfile) => {
        this.userProfile.set(updatedProfile);
        this.isSaving.set(false);
        this.updateError.set(false);
        this.updateMessage.set('Profile updated successfully!');

        // Refresh auth service current user if name changed
        this.authService.getCurrentUser().subscribe();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.updateError.set(true);
        this.updateMessage.set('Failed to update profile. Please try again.');
      }
    });
  }

  protected isPasswordFormValid(): boolean {
    return !!(
      this.passwordForm.currentPassword &&
      this.passwordForm.newPassword &&
      this.passwordForm.confirmNewPassword &&
      this.passwordForm.newPassword === this.passwordForm.confirmNewPassword &&
      this.passwordForm.newPassword.length >= 6
    );
  }

  protected changePassword(): void {
    if (!this.isPasswordFormValid()) return;

    this.isSaving.set(true);
    this.passwordMessage.set('');

    this.profileService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.passwordError.set(false);
        this.passwordMessage.set('Password changed successfully!');

        // Clear form
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        };
      },
      error: (err) => {
        this.isSaving.set(false);
        this.passwordError.set(true);
        this.passwordMessage.set(err.error?.message || 'Failed to change password. Please check your current password.');
      }
    });
  }
}
