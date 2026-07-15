import { Component, inject } from '@angular/core';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { compressImage } from '../../../core/functions/compress-image';

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

    compressImage(file, 800, 0.8).then(compressed => {
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
}
