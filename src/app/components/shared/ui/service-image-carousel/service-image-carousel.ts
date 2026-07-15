import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ServiceImagesInterface } from '../../../../core/interfaces/service.interface';

@Component({
  selector: 'app-service-image-carousel',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './service-image-carousel.html',
})
export class ServiceImageCarousel {

  images = input<ServiceImagesInterface[]>([]);
  alt = input('');

  private offset = signal(0);

  sortedImages = computed(() => [...this.images()].sort((a, b) => a.serviceimageorder - b.serviceimageorder));

  private primaryPosition = computed(() => {
    const idx = this.sortedImages().findIndex(img => img.serviceimageprimary);
    return idx === -1 ? 0 : idx;
  });

  activeIndex = computed(() => {
    const len = this.sortedImages().length;
    if (len === 0) return 0;
    return ((this.primaryPosition() + this.offset()) % len + len) % len;
  });

  currentImage = computed(() => this.sortedImages()[this.activeIndex()] ?? null);

  constructor() {
    // Vuelve siempre a la imagen principal cuando cambia el set de imágenes (ej. tras subir nuevas).
    effect(() => {
      this.images();
      this.offset.set(0);
    });
  }

  prev(event: Event) {
    event.stopPropagation();
    this.offset.update(o => o - 1);
  }

  next(event: Event) {
    event.stopPropagation();
    this.offset.update(o => o + 1);
  }

}
