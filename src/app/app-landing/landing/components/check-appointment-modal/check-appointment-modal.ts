import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Modal del CTA "Consultar mi cita" del hero: el cliente pega el enlace que
 * recibió al reservar (o solo el token) y se navega a la página de estado.
 * Acepta ambos formatos para no exigirle recordar el formato exacto.
 */
@Component({
  selector: 'landing-check-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './check-appointment-modal.html',
})
export class CheckAppointmentModalComponent {
  visible = input<boolean>(false);

  closeRequested = output<void>();
  tokenSubmitted = output<string>();

  control = new FormControl('', [Validators.required]);
  touched = signal(false);

  submit(): void {
    this.touched.set(true);
    const raw = (this.control.value ?? '').trim();
    if (!raw) return;

    // Acepta tanto el link completo (.../citas/<token>) como el token suelto.
    const match = raw.match(/citas\/([0-9a-f-]{36})/i);
    const token = match ? match[1] : raw;
    this.tokenSubmitted.emit(token);
  }

  close(): void {
    this.control.reset('');
    this.touched.set(false);
    this.closeRequested.emit();
  }
}
