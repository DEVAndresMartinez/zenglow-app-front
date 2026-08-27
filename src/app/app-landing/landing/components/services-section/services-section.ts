import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ServiceLandingDto } from '../../../core/interfaces/landing.interface';
import { ServiceImageCarousel } from '../../../../components/shared/ui/service-image-carousel/service-image-carousel';
import { UISearchComponent } from '../../../../components/shared/ui/ui-search-component/ui-search-component';

@Component({
  selector: 'landing-services-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ServiceImageCarousel, UISearchComponent],
  templateUrl: './services-section.html',
})
export class ServicesSectionComponent {
  services = input<ServiceLandingDto[]>([]);
  loading = input<boolean>(false);

  bookService = output<ServiceLandingDto>();

  private search = signal('');

  filteredServices = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    if (!query) return this.services();
    return this.services().filter(s => s.servicename.toLocaleLowerCase().includes(query));
  });

  onSearch(value: string): void {
    this.search.set(value);
  }
}
