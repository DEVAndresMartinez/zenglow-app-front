import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommerceService } from '../../../../core/services/modules/commerce.service';
import { UIInputComponent } from '../ui-input-component/ui-input-component';
import { ChangePasswordRequest } from '../../../../core/interfaces/auth.interface';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newpassword')?.value;
  const confirm = group.get('confirmpassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'change-password-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent],
  templateUrl: './change-password-modal.html',
})
export class ChangePasswordModalComponent {

  private auth = inject(AuthService);
  private commerceService = inject(CommerceService);

  showModal = computed(() => !!this.commerceService.me()?.user.mustchangepassword);

  loading = signal(false);
  error = signal('');
  success = signal(false);

  form: FormGroup = new FormGroup({
    newpassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmpassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  get confirmError(): string {
    const ctrl = this.form.get('confirmpassword');
    if (ctrl?.dirty && this.form.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const dto = { newpassword: this.form.value.newpassword } as ChangePasswordRequest

    this.auth.changePassword(this.commerceService.me()?.user?.useruuid ?? '', dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => {
          const me = this.commerceService.me();
          if (me) {
            this.commerceService.me.set({ ...me, user: { ...me.user, mustchangepassword: false } });
          }
        }, 2500);
      },
      error: (err) => {
        this.error.set('Error al cambiar la contraseña. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    this.commerceService.me.set(null);
    this.auth.logout();
  }
}
