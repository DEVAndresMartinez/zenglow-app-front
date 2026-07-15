import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { ServiceService } from '../../../core/services/modules/service.service';
import { ServiceCategoriesService } from '../../../core/services/modules/service-categories.service';
import { CreateServiceInterface, ServiceInterface } from '../../../core/interfaces/service.interface';
import { STATUS_SERVICE_AVAILABLE } from '../../../core/const/register-const';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  soon: 'Próximamente',
};

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIDropdownComponent],
  templateUrl: './service-form.html',
  styleUrl: './service-form.scss',
})
export class ServiceForm {

  isEdit = input(false);
  serviceuuid = input<string>('');
  service = input<ServiceInterface | null>(null);

  saved = output<ServiceInterface>();
  closed = output();

  responseService = signal<ServiceInterface | null>(null);
  error = signal<string>('');
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  categoryOptions = signal<DropdownOption[]>([]);
  loadingCategories = signal<boolean>(false);

  statusOptions: DropdownOption[] = STATUS_SERVICE_AVAILABLE.filter(v => v !== 'deleted').map(s => ({ abv: s, name: STATUS_LABELS[s] ?? s }));

  serviceForm: FormGroup = new FormGroup({
    categoryuuid: new FormControl<string>(''),
    servicename: new FormControl<string>('', { validators: [Validators.required, Validators.maxLength(80)] }),
    servicedesc: new FormControl<string>(''),
    serviceduration: new FormControl<number | null>(null),
    serviceprice: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    servicestatus: new FormControl<string>('active'),
  });

  private serviceService = inject(ServiceService);
  private categoriesService = inject(ServiceCategoriesService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);
    this.loadCategories();

    if (this.isEdit() && this.service() !== null) {
      this.serviceForm.patchValue({
        categoryuuid: this.service()?.category?.categoryuuid ?? '',
        servicename: this.service()?.servicename,
        servicedesc: this.service()?.servicedesc,
        serviceduration: this.service()?.serviceduration,
        serviceprice: this.service()?.serviceprice,
        servicestatus: this.service()?.servicestatus,
      });
    } else {
      this.serviceForm.reset({ servicestatus: 'active' });
    }
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categoryOptions.set(
          categories
            .filter(c => c.categorystatus === 'active')
            .map(c => ({ abv: c.categoryuuid, name: c.categoryname }))
        );
        this.loadingCategories.set(false);
      },
      error: () => { this.loadingCategories.set(false); },
    });
  }

  get nameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.serviceForm.get('servicename');
    if (ctrl?.errors?.['required']) return 'El nombre es requerido';
    if (ctrl?.errors?.['maxlength']) return 'Máximo 80 caracteres';
    return '';
  }

  get priceError(): string {
    if (!this.sent()) return '';
    const ctrl = this.serviceForm.get('serviceprice');
    if (ctrl?.errors?.['required']) return 'El precio es requerido';
    if (ctrl?.errors?.['min']) return 'Debe ser mayor o igual a 0';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    this.loading.set(true);
    if (this.serviceForm.valid) {
      const dto: CreateServiceInterface = this.serviceForm.value;
      if (!this.isEdit() && this.serviceuuid() === '') {
        this.serviceService.create(dto).subscribe({
          next: (response: ServiceInterface) => {
            this.responseService.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.error.set(body?.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
            this.loading.set(false);
          }
        });
      } else if (this.isEdit() && this.serviceuuid() !== '') {
        this.serviceService.update(this.serviceuuid(), dto).subscribe({
          next: (response: ServiceInterface) => {
            this.responseService.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.error.set(body?.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
            this.loading.set(false);
          }
        });
      }
    } else {
      this.loading.set(false);
    }
  }

}
