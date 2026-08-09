import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'blue' | 'purple' | 'green' | 'amber';

const MODE_KEY = 'zenglow-theme';
const PALETTE_KEY = 'zenglow-palette';

const PALETTE_CLASSES: Record<ThemePalette, string> = {
  blue: '',
  purple: 'palette-purple',
  green: 'palette-green',
  amber: 'palette-amber',
};

export interface PaletteOption {
  key: ThemePalette;
  label: string;
  swatch: string;
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  { key: 'blue', label: 'Azul', swatch: '#2563eb' },
  { key: 'purple', label: 'Morado', swatch: '#7c3aed' },
  { key: 'green', label: 'Verde', swatch: '#16a34a' },
  { key: 'amber', label: 'Ámbar', swatch: '#d97706' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly mode = signal<ThemeMode>(this.getInitialMode());
  readonly palette = signal<ThemePalette>(this.getInitialPalette());

  constructor() {
    effect(() => {
      const mode = this.mode();
      const palette = this.palette();
      const html = document.documentElement;

      html.classList.toggle('dark', mode === 'dark');

      for (const className of Object.values(PALETTE_CLASSES)) {
        if (className) html.classList.remove(className);
      }
      const paletteClass = PALETTE_CLASSES[palette];
      if (paletteClass) html.classList.add(paletteClass);

      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(PALETTE_KEY, palette);
    });
  }

  toggleMode(): void {
    this.mode.update(m => m === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  setPalette(palette: ThemePalette): void {
    this.palette.set(palette);
  }

  private getInitialMode(): ThemeMode {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getInitialPalette(): ThemePalette {
    const stored = localStorage.getItem(PALETTE_KEY);
    if (stored === 'blue' || stored === 'purple' || stored === 'green' || stored === 'amber') return stored;
    return 'blue';
  }
}
