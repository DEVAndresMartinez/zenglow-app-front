import { Component, inject } from '@angular/core';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './business.html',
  styleUrl: './business.scss',
})
export class Business {

  readonly commerceService = inject(CommerceService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.compressImage(file, 800, 0.8).then(compressed => {
      this.commerceService.uploadLogo(compressed).subscribe({
        next: (commerce) => {
          this.commerceService.commerceLogo.set(commerce.commercelogo);
          input.value = '';
        },
        error: (err) => {
          console.error(err);
          input.value = '';
        },
      });
    });
  }

  private compressImage(file: File, maxSize: number, quality: number): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(blob => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };

      img.src = url;
    });
  }
}
