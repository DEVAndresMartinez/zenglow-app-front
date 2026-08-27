import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../../../core/services/landing-commerces.service';
import { PublicAppointmentStatusDto } from '../../../core/interfaces/landing.interface';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de confirmación',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
};

/**
 * Página pública montada en /landing-page/:slug/citas/:token — consulta el
 * estado de una cita sin necesidad de sesión, usando el token de
 * confirmación opaco (uuid) como único identificador, nunca el appointmentuuid.
 */
@Component({
  selector: 'landing-appointment-status',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './appointment-status.html',
})
export class AppointmentStatusComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private landingCommercesService = inject(LandingCommercesService);
  private destroyRef = inject(DestroyRef);

  slug = signal<string | null>(null);
  loading = signal(true);
  appointment = signal<PublicAppointmentStatusDto | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const slug = params.get('slug');
        const token = params.get('token');
        this.slug.set(slug);
        if (token) this.fetch(token);
      });
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  backToLanding(): void {
    const slug = this.slug();
    this.router.navigate(slug ? ['/landing-page', slug] : ['/landing-page']);
  }

  private fetch(token: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.landingCommercesService.getAppointmentByToken(token).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.appointment.set(null);
        this.errorMessage.set(err.error?.message ?? 'No pudimos encontrar tu cita con ese enlace.');
        this.loading.set(false);
      },
    });
  }
}
