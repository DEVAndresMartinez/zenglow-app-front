import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PublicCommerceDto } from '../../../core/interfaces/landing.interface';

/**
 * Hero de la landing pública: identidad del comercio + los dos CTA
 * principales (reservar / consultar una cita existente).
 */
@Component({
  selector: 'landing-hero-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './hero-section.html',
})
export class HeroSectionComponent {
  commerce = input<PublicCommerceDto | null>(null);
  professionalsCount = input<number>(0);
  branchesCount = input<number>(0);
  servicesCount = input<number>(0);

  bookRequested = output<void>();
  checkAppointmentRequested = output<void>();
}
