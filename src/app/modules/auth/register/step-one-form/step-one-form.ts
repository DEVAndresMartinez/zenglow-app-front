import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COMMERCE_TYPES, DOCUMENT_TYPES, STATUS_AVAILABLE } from '../../../../core/const/register-const';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UIDropdownComponent } from '../../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIPhoneInputComponent } from '../../../../components/shared/ui/ui-phone-input-component/ui-phone-input-component';
import { CalcularDigitoVerificacion } from '../../../../core/functions/calculateDv';
import { NumbersOnlyCase } from '../../../../core/directives/numbers-onlit-case';
import { UpperCase } from '../../../../core/directives/upper-case';
import { Lowercase } from '../../../../core/directives/lower-case';
import { CommerceService } from '../../../../core/services/modules/commerce.service';

const COMPONENTS = [UIInputComponent, UIDropdownComponent, UIPhoneInputComponent];
const DIRECTIVES = [NumbersOnlyCase, UpperCase, Lowercase];

@Component({
  selector: 'app-step-one-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...COMPONENTS, ...DIRECTIVES],
  templateUrl: './step-one-form.html',
  styleUrl: './step-one-form.scss',
})
export class StepOneForm implements OnInit {

  private commerceService = inject(CommerceService);
  private destroyRef = inject(DestroyRef);

  commerceTypes = COMMERCE_TYPES;
  documenttypes = DOCUMENT_TYPES;
  statusavailable = STATUS_AVAILABLE;

  commerceForm: FormGroup = new FormGroup({
    commercetype: new FormControl<typeof this.commerceTypes[number]['abv']>(this.commerceTypes[0].abv, { validators: [Validators.required] }),
    commercename: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    commerceslug: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    commerceemail: new FormControl<string>('', { validators: [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(150)] }),
    commercephone: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(13)] }),
    commercedocumenttype: new FormControl<typeof this.documenttypes[number]['abv']>(this.documenttypes[0].abv, { validators: [Validators.required] }),
    commercedocumentnumber: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)] }),
    commercedigitverification: new FormControl<string>(''),
    commercestatus: new FormControl<typeof this.statusavailable[number]>(this.statusavailable[0], { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      if (this.commerceService.triggerValidation() > 0) {
        this.commerceForm.markAllAsTouched();
      }
    });
  }

  ngOnInit() {
    const saved = this.commerceService.commerceData();
    if (saved) this.commerceForm.patchValue(saved);

    this.commerceService.stepOneValid.set(this.commerceForm.valid);

    this.commerceForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.commerceService.commerceData.set(this.commerceForm.value as any);
      this.commerceService.stepOneValid.set(this.commerceForm.valid);
    });
  }

  submit() {
    if (this.commerceForm.valid) {
      alert('Formulario válido. Enviando datos...');
    }
  }

  commerceSlugify() {
    const slug = this.commerceForm.value?.commercename?.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
    this.commerceForm.patchValue({
      commerceslug: slug
    });
  }

  calcDV() {
    const nit = this.commerceForm.value.commercedocumentnumber;
    const dv = CalcularDigitoVerificacion(nit ?? '');
    this.commerceForm.patchValue({
      commercedigitverification: dv.toString()
    });
  }

  setEmailError(): string {
    const control = this.commerceForm.get('commerceemail');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El correo electrónico es obligatorio.';
    if (control.hasError('email')) return 'El correo electrónico no es válido.';
    if (control.hasError('minlength')) return 'El correo electrónico debe tener al menos 6 caracteres.';
    return '';
  }

}
