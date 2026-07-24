import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { RecoverRequest, RecoverResponse } from '../../../core/interfaces/auth.interface';

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

  forgotForm: FormGroup = new FormGroup({
    useremail: new FormControl<string>('', { validators: [Validators.required, Validators.email, Validators.maxLength(150)] }),
    username: new FormControl<string>('', { validators: [Validators.required, Validators.maxLength(150)] })
  });

  private auth = inject(AuthService);

  submit() {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);
    this.auth.recoverPassword(this.forgotForm.value as RecoverRequest).subscribe({
      next: () => {
        this.sent.set(true);
        this.loading.set(false);
      }, error: () => { }
    });
    this.loading.set(false);

  }
}
