import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../core/services/landing-commerces.service';
import { LandingFoundInterface, PublicProfessionalDto, ServiceLandingDto } from '../core/interfaces/landing.interface';
import { SlugModalComponent } from './components/slug-modal/slug-modal';
import { CheckAppointmentModalComponent } from './components/check-appointment-modal/check-appointment-modal';
import { BookingWizardComponent } from './components/booking-wizard/booking-wizard';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { ServicesSectionComponent } from './components/services-section/services-section';
import { ProfessionalsSectionComponent } from './components/professionals-section/professionals-section';
import { BranchesSectionComponent } from './components/branches-section/branches-section';
import { FooterSectionComponent } from './components/footer-section/footer-section';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, FontAwesomeModule,
    SlugModalComponent, CheckAppointmentModalComponent, BookingWizardComponent,
    HeroSectionComponent, ServicesSectionComponent, ProfessionalsSectionComponent,
    BranchesSectionComponent, FooterSectionComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private landingCommercesService = inject(LandingCommercesService);
  private destroyRef = inject(DestroyRef);

  slug = signal<string | null>(null);
  loading = signal<boolean>(true);
  commerceFound = signal<LandingFoundInterface | null>(null);
  errorMessage = signal<string | null>(null);

  services = signal<ServiceLandingDto[]>([]);
  servicesLoading = signal<boolean>(false);

  showSlugModal = signal<boolean>(false);
  slugModalError = signal<string | null>(null);

  showCheckAppointmentModal = signal<boolean>(false);

  showBookingWizard = signal<boolean>(false);
  bookingPreselectedServiceUuid = signal<string | null>(null);
  bookingPreselectedProfessionalUuid = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const slug = params.get('slug');
        this.slug.set(slug);

        if (slug) {
          this.fetchCommerce(slug);
        } else {
          this.loading.set(false);
          this.commerceFound.set(null);
          this.services.set([]);
          this.errorMessage.set(null);
          this.slugModalError.set(null);
          this.showSlugModal.set(true);
        }
      });
  }

  onSlugSubmit(slug: string): void {
    this.showSlugModal.set(false);
    this.router.navigate(['/landing-page', slug]);
  }

  openBookingWizard(): void {
    this.bookingPreselectedServiceUuid.set(null);
    this.bookingPreselectedProfessionalUuid.set(null);
    this.showBookingWizard.set(true);
  }

  onBookService(service: ServiceLandingDto): void {
    this.bookingPreselectedServiceUuid.set(service.serviceuuid);
    this.bookingPreselectedProfessionalUuid.set(null);
    this.showBookingWizard.set(true);
  }

  onBookProfessional(professional: PublicProfessionalDto): void {
    this.bookingPreselectedProfessionalUuid.set(professional.useruuid);
    this.bookingPreselectedServiceUuid.set(null);
    this.showBookingWizard.set(true);
  }

  onBooked(): void {
    // El wizard ya muestra su propia pantalla de confirmación con el enlace de la cita; no hace
    // falta refrescar el agregado del comercio (ya no incluye citas, ver LandingCommerceDto).
  }

  onCheckAppointmentToken(token: string): void {
    this.showCheckAppointmentModal.set(false);
    const slug = this.slug();
    if (slug) this.router.navigate(['/landing-page', slug, 'citas', token]);
  }

  private fetchCommerce(slug: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.services.set([]);

    this.landingCommercesService.getCommerceBySlug(slug).subscribe({
      next: (data) => {
        this.commerceFound.set(data);
        this.loading.set(false);
        this.showSlugModal.set(false);
        this.slugModalError.set(null);
        this.fetchServices(data.commerce.commerceuuid);
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message ?? 'No se pudo cargar la información del comercio.';
        this.loading.set(false);
        this.commerceFound.set(null);
        this.errorMessage.set(message);
        this.slugModalError.set(message);
        this.showSlugModal.set(true);
      },
    });
  }

  private fetchServices(commerceuuid: string): void {
    this.servicesLoading.set(true);

    this.landingCommercesService.getServicesByCommerce(commerceuuid).subscribe({
      next: (services) => {
        this.services.set(services);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.services.set([]);
        this.servicesLoading.set(false);
      },
    });
  }
}
