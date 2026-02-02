import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'game';

export interface ThemeOption {
    value: Theme;
    label: string;
    icon: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'game', label: 'Game', icon: '🎮' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 's4c-theme';

    /** Current active theme */
    currentTheme = signal<Theme>(this.getInitialTheme());

    /** Available theme options for UI */
    readonly themeOptions = THEME_OPTIONS;

    constructor() {
        // Effect to apply theme changes to DOM and persist
        effect(() => {
            const theme = this.currentTheme();
            this.applyTheme(theme);
            this.persistTheme(theme);
        });
    }

    /**
     * Set the active theme
     */
    setTheme(theme: Theme): void {
        this.currentTheme.set(theme);
    }

    /**
     * Cycle to the next theme in order
     */
    toggleTheme(): void {
        const themes: Theme[] = ['light', 'dark', 'game'];
        const currentIndex = themes.indexOf(this.currentTheme());
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    /**
     * Check if current theme is dark mode
     */
    isDarkTheme(): boolean {
        return this.currentTheme() === 'dark';
    }

    /**
     * Check if current theme is game mode
     */
    isGameTheme(): boolean {
        return this.currentTheme() === 'game';
    }

    /**
     * Get the initial theme from storage or system preference
     */
    private getInitialTheme(): Theme {
        // Check localStorage first
        const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
        if (saved && this.isValidTheme(saved)) {
            return saved;
        }

        // Check system preference for dark mode
        if (typeof window !== 'undefined' && window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }

        // Default to light
        return 'light';
    }

    /**
     * Apply theme to the document
     */
    private applyTheme(theme: Theme): void {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);

            // Also update meta theme-color for mobile browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                const colors: Record<Theme, string> = {
                    light: '#667eea',
                    dark: '#1e293b',
                    game: '#58cc02',
                };
                metaThemeColor.setAttribute('content', colors[theme]);
            }
        }
    }

    /**
     * Persist theme choice to localStorage
     */
    private persistTheme(theme: Theme): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }
    }

    /**
     * Validate theme value
     */
    private isValidTheme(value: string): value is Theme {
        return ['light', 'dark', 'game'].includes(value);
    }
}
