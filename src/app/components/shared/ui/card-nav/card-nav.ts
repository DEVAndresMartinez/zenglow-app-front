import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-card-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './card-nav.html',
  styleUrl: './card-nav.scss',
})
export class CardNav {

  @Input() icon: IconProp = ['fas', 'question'];
  @Input() color: string = 'text-gray-500';
  @Input() title: string = 'Card Title';
  @Input() description: string = 'Card description goes here.';
  @Input() link: string = '#';

  constructor() { }

}
