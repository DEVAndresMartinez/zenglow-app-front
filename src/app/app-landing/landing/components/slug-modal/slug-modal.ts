import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';

/**
 * Modal que se muestra cuando la landing no recibe slug por la URL (o el
 * slug recibido no fue válido), para que el usuario lo digite manualmente.
 */
@Component({
  selector: 'landing-slug-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent],
  templateUrl: './slug-modal.html',
})
export class SlugModalComponent {

  visible = input<boolean>(false);
  errorMessage = input<string | null>(null);

  submitSlug = output<string>();

  control = new FormControl('', [Validators.required]);
  touched = signal(false);

  submit(): void {
    this.touched.set(true);
    const value = (this.control.value ?? '').trim();
    if (!value) return;
    this.submitSlug.emit(value);
  }
}
