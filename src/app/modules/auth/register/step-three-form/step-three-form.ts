import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';
import { UIPhoneInputComponent } from '../../../../components/shared/ui/ui-phone-input-component/ui-phone-input-component';
import { STATUS_USER_AVAILABLE } from '../../../../core/const/register-const';
import { Lowercase } from '../../../../core/directives/lower-case';
import { CommerceService } from '../../../../core/services/modules/commerces/commerce.service';

const COMPONENTS = [UIInputComponent, UIPhoneInputComponent];
const DIRECTIVES = [Lowercase];

@Component({
  selector: 'app-step-three-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...COMPONENTS, ...DIRECTIVES],
  templateUrl: './step-three-form.html',
  styleUrl: './step-three-form.scss',
})
export class StepThreeForm implements OnInit {

  private commerceService = inject(CommerceService);
  private destroyRef = inject(DestroyRef);

  statusavailable = STATUS_USER_AVAILABLE;

  userForm = new FormGroup({
    userfirstname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    userlastname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    userphone: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(13)] }),
    username: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    useremail: new FormControl<string>('', { validators: [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(150)] }),
    userpassword: new FormControl<string>(''),
    branchuuid: new FormControl<string>(''),
    userstatus: new FormControl<typeof this.statusavailable[number]>(this.statusavailable[0], { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      if (this.commerceService.triggerValidation() > 0) {
        this.userForm.markAllAsTouched();
      }
    });
  }

  ngOnInit() {
    const saved = this.commerceService.userData();
    if (saved) this.userForm.patchValue(saved);

    this.commerceService.stepThreeValid.set(this.userForm.valid);

    this.userForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.commerceService.userData.set(this.userForm.value as any);
      this.commerceService.stepThreeValid.set(this.userForm.valid);
    });
  }

  submit() {
    if (this.userForm.valid) {
      alert('Formulario válido. Enviando datos...');
    }
  }

  generatePassword() {
    const USERNAME = this.userForm.value?.userfirstname?.toUpperCase().slice(1, 3) ?? '';
    const LASTNAME = this.userForm.value?.userlastname?.toLowerCase().slice(1, 3) ?? '';
    const PHONE = this.userForm.value?.userphone?.slice(1, 5) ?? '';
    this.userForm.patchValue({
      userpassword: USERNAME + LASTNAME + PHONE
    });
  }

  setEmailError(): string {
    const control = this.userForm.get('useremail');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El correo electrónico es obligatorio.';
    if (control.hasError('email')) return 'El correo electrónico no es válido.';
    if (control.hasError('minlength')) return 'El correo electrónico debe tener al menos 6 caracteres.';
    return '';
  }


}
