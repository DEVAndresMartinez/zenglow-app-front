import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PALETTE_OPTIONS, ThemePalette, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

  readonly themeService = inject(ThemeService);
  readonly paletteOptions = PALETTE_OPTIONS;

  toggleTheme(): void {
    this.themeService.toggleMode();
  }

  selectPalette(palette: ThemePalette): void {
    this.themeService.setPalette(palette);
  }
}
