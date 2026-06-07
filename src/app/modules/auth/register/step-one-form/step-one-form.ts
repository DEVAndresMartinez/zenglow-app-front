import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { COMMERCE_TYPES, DOCUMENT_TYPES, STATUS_AVAILABLE } from '../../../../core/const/register-const';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIDropdownComponent } from '../../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIPhoneInputComponent } from '../../../../components/shared/ui/ui-phone-input-component/ui-phone-input-component';

const COMPONENTS = [UIInputComponent, UIDropdownComponent, UIPhoneInputComponent];

@Component({
  selector: 'app-step-one-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...COMPONENTS],
  templateUrl: './step-one-form.html',
  styleUrl: './step-one-form.scss',
})
export class StepOneForm {

  commerceTypes = COMMERCE_TYPES;
  documenttypes = DOCUMENT_TYPES;
  statusavailable = STATUS_AVAILABLE;

  // Form con signals
  commercetype = signal<typeof this.commerceTypes[number]['abv']>(this.commerceTypes[0].abv);
  commercename = signal<string>('');
  commerceslug = signal<string>('');
  commerceemail = signal<string>('');
  emailTouched  = signal(false);
  commercephone = signal<string>('');
  commercedocumenttype = signal<typeof this.documenttypes[number]['abv']>(this.documenttypes[0].abv);
  commercedocumentnumber = signal<string>('');
  commercedigitverification = signal<string>('');
  commercestatus = signal<typeof this.statusavailable[number]>(this.statusavailable[0]);

  // loginForm = signalForm({

  // });

  constructor() { }

  ngOnInit(): void {

  }

  isValid = computed(() => {
    return (
      this.commercename() !== '' && this.commercename().trim().length > 3 &&
      this.commerceslug() !== '' && this.commerceslug().trim().length > 3 &&
      this.commerceemail() !== '' && this.commerceemail().includes('@') && this.commerceemail().includes('.') && this.commerceemail().trim().length > 5 &&
      this.commercephone() !== '' && this.commercephone().trim().length >= 7 && this.commercephone().trim().length <= 13 &&
      this.commercedocumentnumber() !== '' && this.commercedocumentnumber().trim().length > 6 &&
      this.commercedigitverification() !== ''
    );
  });

  submit() {
    if (this.isValid()) {
      alert('Formulario válido. Enviando datos...');
    }
  }

  commerceSlugify() {
    const slug = this.commercename().toLowerCase()
      .replace(/ /g, '-') // Reemplaza espacios por guiones
      .replace(/[^\w-]+/g, ''); // Elimina caracteres no alfanuméricos excepto guiones
    this.commerceslug.set(slug);
  }

  onEmailInput(value: string) {
    this.commerceemail.set(value);
    this.emailTouched.set(true);
  }

  setEmailError(): string {
    if (!this.emailTouched()) return '';
    if (this.commerceemail() === '') return 'El correo electrónico es obligatorio.';
    if (!this.commerceemail().includes('@') || !this.commerceemail().includes('.')) return 'El correo electrónico no es válido.';
    if (this.commerceemail().trim().length <= 5) return 'El correo electrónico debe tener al menos 6 caracteres.';
    return '';
  }

}
