import { Component } from '@angular/core';
import { Options } from './options/options';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../components/layout/navbar/navbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const COMPONENTS = [Options, Navbar];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ...COMPONENTS],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
