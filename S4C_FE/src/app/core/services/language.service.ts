import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private translate = inject(TranslateService);

    // Signals
    currentLang = signal<string>('en');

    constructor() {
        this.initLanguage();
    }

    private initLanguage() {
        this.translate.addLangs(['en', 'vi']);

        // Try to get saved language from local storage
        const savedLang = localStorage.getItem('s4c_lang');

        if (savedLang && ['en', 'vi'].includes(savedLang)) {
            this.setLanguage(savedLang);
        } else {
            // Default to English or browser language if supported
            const browserLang = this.translate.getBrowserLang();
            const defaultLang = browserLang?.match(/en|vi/) ? browserLang : 'vi';
            this.setLanguage(defaultLang);
        }
    }

    setLanguage(lang: string) {
        if (['en', 'vi'].includes(lang)) {
            this.translate.use(lang);
            this.currentLang.set(lang);
            localStorage.setItem('s4c_lang', lang);
        }
    }

    getCurrentLang(): string {
        return this.currentLang();
    }
}
