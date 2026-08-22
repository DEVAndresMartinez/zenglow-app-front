import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppointmentsService } from '../../../core/services/modules/appointment.service';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { AppointmentDailyInterface } from '../../../core/interfaces/appointment.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  private appointmentsService = inject(AppointmentsService);
  private commerceService = inject(CommerceService);

  daily = signal<AppointmentDailyInterface | null>(null);
  loading = signal(true);

  constructor() {
    const useruuid = this.commerceService.me()?.user.useruuid;
    if (!useruuid) {
      this.loading.set(false);
      return;
    }
    this.appointmentsService.getDaily(useruuid).subscribe({
      next: (response) => {
        this.daily.set(response);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

}
