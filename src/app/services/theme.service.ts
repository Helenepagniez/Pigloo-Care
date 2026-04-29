import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'pigloo_dark_mode';
  darkMode = signal<boolean>(localStorage.getItem(this.THEME_KEY) === 'true');

  constructor() {
    effect(() => {
      const isDark = this.darkMode();
      localStorage.setItem(this.THEME_KEY, isDark.toString());
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });
  }

  toggleDarkMode() {
    this.darkMode.set(!this.darkMode());
  }
}
