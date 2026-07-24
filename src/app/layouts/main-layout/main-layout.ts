import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Navbar } from '../../components/layout/navbar/navbar';
import { Options } from '../../modules/common/home/options/options';

const COMPONENTS = [Navbar, Options];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FontAwesomeModule, ...COMPONENTS],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  sidebarOpen = signal(false);
}
