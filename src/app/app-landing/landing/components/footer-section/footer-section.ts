import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PublicCommerceDto } from '../../../core/interfaces/landing.interface';

@Component({
  selector: 'landing-footer-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './footer-section.html',
})
export class FooterSectionComponent {
  commerce = input<PublicCommerceDto | null>(null);
}
