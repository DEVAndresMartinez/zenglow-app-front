import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceService } from '../../../core/services/modules/service.service';
import { ServiceImagesInterface, ServiceInterface } from '../../../core/interfaces/service.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

const MAX_IMAGES = 5;

interface PendingImage {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-service-images-form',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './service-images-form.html',
  styleUrl: './service-images-form.scss',
})
export class ServiceImagesForm {

  serviceuuid = input<string>('');
  service = input<ServiceInterface | null>(null);

  saved = output<ServiceImagesInterface[]>();
  closed = output();

  pendingImages = signal<PendingImage[]>([]);
  primaryIndex = signal<number>(0);
  error = signal<string>('');
  loading = signal<boolean>(false);

  private serviceService = inject(ServiceService);

  get maxImages(): number {
    return MAX_IMAGES;
  }

  close() {
    this.pendingImages().forEach(p => URL.revokeObjectURL(p.previewUrl));
    this.closed.emit();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, MAX_IMAGES);
    if (files.length === 0) return;

    this.pendingImages().forEach(p => URL.revokeObjectURL(p.previewUrl));
    this.pendingImages.set(files.map(file => ({ file, previewUrl: URL.createObjectURL(file) })));
    this.primaryIndex.set(0);
    this.error.set('');
    input.value = '';
  }

  removeImage(index: number) {
    const removed = this.pendingImages()[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    this.pendingImages.update(imgs => imgs.filter((_, i) => i !== index));
    if (this.primaryIndex() >= this.pendingImages().length) {
      this.primaryIndex.set(0);
    }
  }

  setPrimary(index: number) {
    this.primaryIndex.set(index);
  }

  submit() {
    const images = this.pendingImages();
    if (images.length === 0 || this.serviceuuid() === '') return;

    this.loading.set(true);
    this.error.set('');
    this.serviceService.uploadImages(this.serviceuuid(), images.map(i => i.file), this.primaryIndex()).subscribe({
      next: (response: ServiceImagesInterface[]) => {
        this.pendingImages().forEach(p => URL.revokeObjectURL(p.previewUrl));
        this.pendingImages.set([]);
        this.loading.set(false);
        this.saved.emit(response);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.error.set(body?.message || 'No se pudieron subir las imágenes. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

}
