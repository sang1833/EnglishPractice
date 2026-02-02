import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl flex-shrink-0 hidden md:flex md:flex-col">
        <!-- Logo Section -->
        <div class="p-6 border-b border-slate-700/50">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">S4C Admin</h1>
              <p class="text-xs text-slate-400">IELTS Platform</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a 
            routerLink="/admin/dashboard" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center px-4 py-3 text-slate-300 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:text-white group"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="font-medium">Dashboard</span>
          </a>

          <a 
            routerLink="/admin/exams" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/50"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center px-4 py-3 text-slate-300 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:text-white group"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Exam Manage</span>
            @if (examCount() > 0) {
              <span class="ml-auto bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {{ examCount() }}
              </span>
            }
          </a>

          <a 
            routerLink="/admin/import" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/50"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center px-4 py-3 text-slate-300 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:text-white group"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="font-medium">Import JSON</span>
          </a>

          <a 
            routerLink="/admin/create" 
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/50"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center px-4 py-3 text-slate-300 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:text-white group"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="font-medium">Create New Exam</span>
          </a>

          <!-- Divider -->
          <div class="pt-4 pb-2">
            <div class="h-px bg-slate-700"></div>
          </div>

          <!-- Additional Items -->
          <a 
            href="#" 
            class="flex items-center px-4 py-3 text-slate-300 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:text-white group"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Settings</span>
          </a>
        </nav>

        <!-- User Profile Card -->
        <div class="p-4 border-t border-slate-700/50">
          <div class="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-lg">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                {{ userInitials() }}
              </div>
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ authService.currentUser()?.name }}</p>
              <p class="text-xs text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
            </div>
            <button (click)="authService.logout()" class="text-slate-400 hover:text-white transition-colors" title="Logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <!-- Breadcrumb & Title -->
              <div class="flex items-center space-x-4">
                <button class="md:hidden text-gray-500 hover:text-gray-700">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ pageTitle() }}</h2>
                  <p class="text-sm text-gray-500 mt-0.5">{{ pageSubtitle() }}</p>
                </div>
              </div>

              <!-- Header Actions -->
              <div class="flex items-center space-x-4">
                <!-- Search Bar -->
                <div class="hidden lg:block relative">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search... (Ctrl+K)"
                      class="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <!-- Notifications -->
                <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <!-- User Menu -->
                <div class="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div class="text-right hidden sm:block">
                    <p class="text-sm font-medium text-gray-700">{{ authService.currentUser()?.name }}</p>
                    <p class="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button class="relative group">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                      {{ userInitials() }}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50">
          <div class="animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminLayoutComponent {
  protected readonly examCount = signal(12);
  protected readonly pageTitle = signal('Dashboard');
  protected readonly pageSubtitle = signal('Welcome to S4C Admin Portal');

  authService = inject(AuthService);

  userInitials() {
    const name = this.authService.currentUser()?.name || '';
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
