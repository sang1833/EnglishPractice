import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row bg-[image:var(--gradient-primary)]">
      <div class="flex-1 flex flex-col items-center justify-center p-8 max-w-[480px] mx-auto md:max-w-1/2 md:flex-none md:w-1/2">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-text-inverse m-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Study4Clone</h1>
          <p class="text-white/80 mt-2 text-base">IELTS Mock Test Platform</p>
        </div>
        <div class="w-full bg-surface rounded-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          <router-outlet />
        </div>
      </div>
      <div class="hidden md:flex md:w-1/2 bg-[url('/assets/images/auth-bg.jpg')] bg-center bg-cover relative">
        <div class="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-90"></div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent { }
