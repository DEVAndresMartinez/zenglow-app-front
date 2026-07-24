import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChangePasswordRequest } from '../../../core/interfaces/auth.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newpassword')?.value;
  const confirm = group.get('confirmpassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-change-password-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent],
  templateUrl: './change-password-form.html',
})
export class ChangePasswordForm {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  saved = output<void>();
  closed = output();

  success = signal(false);
  error = signal('');
  sent = signal(false);
  loading = signal(false);

  private authService = inject(AuthService);

  form: FormGroup = new FormGroup({
    newpassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmpassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  get passwordError(): string {
    if (!this.sent()) return '';
    const ctrl = this.form.get('newpassword');
    if (ctrl?.errors?.['required'])  return 'La contraseña es requerida';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 8 caracteres';
    return '';
  }

  get confirmError(): string {
    if (!this.sent()) return '';
    const ctrl = this.form.get('confirmpassword');
    if (ctrl?.errors?.['required']) return 'Confirma la contraseña';
    if (this.form.errors?.['passwordMismatch']) return 'Las contraseñas no coinciden';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const dto: ChangePasswordRequest = { newpassword: this.form.value.newpassword ?? '' };

    this.authService.changePassword(this.useruuid(), dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.saved.emit();
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.error.set(body?.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

}
