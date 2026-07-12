import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { UIPhoneInputComponent } from '../../shared/ui/ui-phone-input-component/ui-phone-input-component';
import { BranchService } from '../../../core/services/modules/branch.service';
import { STATUS_BRANCH_AVAILABLE } from '../../../core/const/register-const';
import { CITIES } from '../../../core/const/cities';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BranchesInterface, CreateBranchInterface } from '../../../core/interfaces/branch.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  maintenance: 'Mantenimiento',
};

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIDropdownComponent, UIPhoneInputComponent],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.scss',
})
export class BranchForm {

  isEdit = input(false);
  branchuuid = input<string>('');
  branch = input<CreateBranchInterface | null>(null);

  saved = output<BranchesInterface>();
  closed = output();

  responseBranch = signal<BranchesInterface | null>(null);
  error = signal<string>('');
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  citiesOptions: DropdownOption[] = CITIES.map(city => ({ abv: city, name: city }));
  statusOptions: DropdownOption[] = STATUS_BRANCH_AVAILABLE.filter(v => v !== 'deleted').map(s => ({ abv: s, name: STATUS_LABELS[s] ?? s }));

  branchForm: FormGroup = new FormGroup({
    branchname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(150)] }),
    branchcity: new FormControl<string>('', { validators: [Validators.required] }),
    branchaddress: new FormControl<string>(''),
    branchphone: new FormControl<string>(''),
    branchstatus: new FormControl<string>('active'),
  });

  private branchService = inject(BranchService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);
    if (this.isEdit() && this.branch() !== null) {
      this.branchForm.patchValue({
        branchname: this.branch()?.branchname,
        branchcity: this.branch()?.branchcity,
        branchaddress: this.branch()?.branchaddress,
        branchphone: this.branch()?.branchphone,
        branchstatus: this.branch()?.branchstatus,
      });
    } else {
      this.branchForm.reset({ branchstatus: 'active' });
    }
  }

  get nameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.branchForm.get('branchname');
    if (ctrl?.errors?.['required']) return 'El nombre es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 3 caracteres';
    if (ctrl?.errors?.['maxlength']) return 'Máximo 150 caracteres';
    return '';
  }

  get cityError(): string {
    if (!this.sent()) return '';
    const ctrl = this.branchForm.get('branchcity');
    if (ctrl?.errors?.['required']) return 'Selecciona una ciudad';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    this.loading.set(true);
    if (this.branchForm.valid) {
      if (!this.isEdit() && this.branchuuid() === '') {
        this.branchService.create(this.branchForm.value as CreateBranchInterface).subscribe({
          next: (response: BranchesInterface) => {
            this.responseBranch.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          }
        });
      } else if (this.isEdit() && this.branchuuid() !== '') {
        this.branchService.update(this.branchuuid(), this.branchForm.value as CreateBranchInterface).subscribe({
          next: (response: BranchesInterface) => {
            this.responseBranch.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          }
        });
      }
    } else {
      this.loading.set(false);
    }
  }

  handleError(error: string, message?: string) {
    switch (error) {
      case 'AE_NAME_CONFLICT':
        this.error.set('El nombre de la sucursal ya está en uso.');
        break;
      case 'AE_ADDRESS_CONFLICT':
        this.error.set('La dirección ingresada ya está asociada a otra sucursal.');
        break;
      default:
        this.error.set(message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
    }
  }

}
