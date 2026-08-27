import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PublicProfessionalDto } from '../../../core/interfaces/landing.interface';

@Component({
  selector: 'landing-professionals-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './professionals-section.html',
})
export class ProfessionalsSectionComponent {
  professionals = input<PublicProfessionalDto[]>([]);
  loading = input<boolean>(false);

  bookProfessional = output<PublicProfessionalDto>();
}
