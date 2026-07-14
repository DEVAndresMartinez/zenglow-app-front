import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { UIPhoneInputComponent } from '../../shared/ui/ui-phone-input-component/ui-phone-input-component';
import { CustomerService } from '../../../core/services/modules/customer.service';
import { CUSTOMER_DOCUMENT_TYPES, STATUS_CUSTOMER_AVAILABLE } from '../../../core/const/register-const';
import { CITIES } from '../../../core/const/cities';
import { CreateCustomerInterface, CustomersInterface } from '../../../core/interfaces/customer.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';
import { CalcularDigitoVerificacion } from '../../../core/functions/calculateDv';
import { NumbersOnlyCase } from '../../../core/directives/numbers-onlit-case';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  blocked: 'Bloqueado',
  deleted: 'Eliminado',
};

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIDropdownComponent, UIPhoneInputComponent, NumbersOnlyCase],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
})
export class CustomerForm {

  isEdit = input(false);
  customeruuid = input<string>('');
  customer = input<CustomersInterface | null>(null);

  saved = output<CustomersInterface>();
  closed = output();

  responseCustomer = signal<CustomersInterface | null>(null);
  error = signal<string>('');
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  citiesOptions: DropdownOption[] = CITIES.map(city => ({ abv: city, name: city }));
  documentTypeOptions: DropdownOption[] = CUSTOMER_DOCUMENT_TYPES;
  statusOptions: DropdownOption[] = STATUS_CUSTOMER_AVAILABLE.filter(v => v !== 'deleted').map(s => ({ abv: s, name: STATUS_LABELS[s] ?? s }));

  customerForm: FormGroup = new FormGroup({
    customerdocumenttype: new FormControl<string>('', { validators: [Validators.required] }),
    customerdocumentnumber: new FormControl<string>('', { validators: [Validators.required, Validators.maxLength(20)] }),
    customerdigitverification: new FormControl<string>(''),
    customerfirstname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)] }),
    customerlastname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)] }),
    customerphone: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(7), Validators.maxLength(13)] }),
    customeremail: new FormControl<string>('', { validators: [Validators.required, Validators.email, Validators.maxLength(150)] }),
    customercity: new FormControl<string>(''),
    customerbirthdate: new FormControl<string>(''),
    customerstatus: new FormControl<string>('active'),
  });

  private customerService = inject(CustomerService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);

    this.customerForm.patchValue({
      customerdocumenttype: 'CC',
      customerstatus: 'active',
    })

    if (this.isEdit() && this.customer() !== null) {
      this.customerForm.patchValue({
        customerdocumenttype: this.customer()?.customerdocumenttype,
        customerdocumentnumber: this.customer()?.customerdocumentnumber,
        customerdigitverification: this.customer()?.customerdigitverification,
        customerfirstname: this.customer()?.customerfirstname,
        customerlastname: this.customer()?.customerlastname,
        customerphone: this.customer()?.customerphone,
        customeremail: this.customer()?.customeremail,
        customercity: this.customer()?.customercity,
        customerbirthdate: this.customer()?.customerbirthdate,
        customerstatus: this.customer()?.customerstatus,
      });
    } else {
      this.customerForm.reset({ customerstatus: 'active' });
    }
  }

  get documentTypeError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customerdocumenttype');
    if (ctrl?.errors?.['required']) return 'Selecciona un tipo de documento';
    return '';
  }

  get documentNumberError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customerdocumentnumber');
    if (ctrl?.errors?.['required']) return 'El número de documento es requerido';
    return '';
  }

  get firstnameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customerfirstname');
    if (ctrl?.errors?.['required'])  return 'El nombre es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 2 caracteres';
    return '';
  }

  get lastnameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customerlastname');
    if (ctrl?.errors?.['required'])  return 'El apellido es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 2 caracteres';
    return '';
  }

  get emailError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customeremail');
    if (ctrl?.errors?.['required']) return 'El correo es requerido';
    if (ctrl?.errors?.['email'])    return 'Correo inválido';
    return '';
  }

  get phoneError(): string {
    if (!this.sent()) return '';
    const ctrl = this.customerForm.get('customerphone');
    if (ctrl?.errors?.['required']) return 'El teléfono es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 7 caracteres';
    if (ctrl?.errors?.['maxlength']) return 'Máximo 15 caracteres';
    return '';
  }

  close() {
    this.closed.emit();
  }

  calcDV() {
    const documentnumber = this.customerForm.value.customerdocumentnumber;
    const dv = CalcularDigitoVerificacion(documentnumber ?? '');
    this.customerForm.patchValue({
      customerdigitverification: dv.toString()
    });
  }

  submit() {
    this.sent.set(true);
    this.loading.set(true);
    if (this.customerForm.valid) {
      this.customerForm.patchValue({
        customerbirthdate: this.customerForm.value.customerbirthdate !== '' ? this.customerForm.value.customerbirthdate : null,
      });
      const dto: CreateCustomerInterface = this.customerForm.value;
      if (!this.isEdit()) {
        this.customerService.create(dto).subscribe({
          next: (response: CustomersInterface) => {
            this.responseCustomer.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          },
        });
      } else if (this.isEdit() && this.customeruuid() !== '') {
        this.customerService.update(this.customeruuid(), dto).subscribe({
          next: (response: CustomersInterface) => {
            this.responseCustomer.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          },
        });
      }
    } else {
      this.loading.set(false);
    }
  }

  handleError(error: string, message?: string) {
    switch (error) {
      case 'AE_DOCUMENT_NUMBER_CONFLICT':
        this.error.set('El número de documento ya está registrado.');
        break;
      default:
        this.error.set(message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
    }
  }

}
