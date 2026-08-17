import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../core/services/landing-commerces.service';
import { LandingFoundInterface, ServiceLandingDto } from '../core/interfaces/landing.interface';
import { SlugModalComponent } from './components/slug-modal/slug-modal';
import { AppointmentsCalendarComponent } from './components/appointments-calendar/appointments-calendar';
import { ServiceImageCarousel } from '../../components/shared/ui/service-image-carousel/service-image-carousel';
import { BookingWizardComponent } from './components/booking-wizard/booking-wizard';
import { UISearchComponent } from '../../components/shared/ui/ui-search-component/ui-search-component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule,
    SlugModalComponent, AppointmentsCalendarComponent, ServiceImageCarousel, BookingWizardComponent, UISearchComponent,
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
  servicesCopy = signal<ServiceLandingDto[]>([]);
  servicesLoading = signal<boolean>(false);
  showSlugModal = signal<boolean>(false);
  slugModalError = signal<string | null>(null);

  showBookingWizard = signal<boolean>(false);

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
          this.servicesCopy.set([]);
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

  onBooked(): void {
    // Refresca el comercio para que la cita recién creada aparezca en el calendario.
    const slug = this.slug();
    if (slug) this.fetchCommerce(slug);
  }

  private fetchCommerce(slug: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.services.set([]);
    this.servicesCopy.set([]);

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
        this.servicesCopy.set(services);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.services.set([]);
        this.servicesCopy.set([]);
        this.servicesLoading.set(false);
      },
    });
  }

  onCatalogSearch(value: string) {
    const query = value.toLocaleLowerCase();
    this.servicesCopy.set(this.services().filter(s => s.servicename.toLocaleLowerCase().includes(query)));
  }
}
