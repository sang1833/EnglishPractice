import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <app-header />
      <main class="flex-1 py-8 px-4 md:p-8">
        <router-outlet />
      </main>
      <footer class="bg-surface-alt text-muted py-6 px-4 text-center text-sm border-t border-border">
        <div class="max-w-[1200px] mx-auto">
          <p>&copy; 2026 Study4Clone. No rights reserved.</p>
        </div>
      </footer>
    </div>
  `
})
export class MainLayoutComponent { }
