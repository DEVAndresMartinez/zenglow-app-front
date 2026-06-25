import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';

const COMPONENTS = [UIInputComponent];

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterLink, ...COMPONENTS],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {

  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  forgotForm = new FormGroup({
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(150)]
    })
  });

  submit() {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);
    // TODO: conectar con el servicio de recuperación
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
    }, 1200);
  }
}
