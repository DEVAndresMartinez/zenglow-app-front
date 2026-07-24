import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResponseSaleDetailInterface, SaleDetailRequestInterface, SaleResponseInterface, UpdateSaleDetailDto, UpdateSaleRequestInterface } from '../../../core/interfaces/sale.interface';
import { CustomerService } from '../../../core/services/modules/customer.service';
import { UserService } from '../../../core/services/modules/user.service';
import { SaleService } from '../../../core/services/modules/sale.service';
import { ServiceService } from '../../../core/services/modules/service.service';
import { ServiceInterface } from '../../../core/interfaces/service.interface';
import { CustomersInterface } from '../../../core/interfaces/customer.interface';
import { UISearchComponent } from '../../shared/ui/ui-search-component/ui-search-component';
import { ServiceImageCarousel } from '../../shared/ui/service-image-carousel/service-image-carousel';
import { UIConfirmModalComponent } from '../../shared/ui/ui-confirm-modal/ui-confirm-modal';
import { CustomerForm } from '../customer-form/customer-form';
import { ServiceForm } from '../service-form/service-form';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent, UISearchComponent, ServiceImageCarousel, UIConfirmModalComponent, CustomerForm, ServiceForm],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss',
})
export class SaleForm {

  isEdit = input(false);
  saleuuid = input<string>('');
  sale = input<SaleResponseInterface | null>(null);

  saved = output<SaleResponseInterface>();
  closed = output();

  currentSale = signal<SaleResponseInterface | null>(null);

  customers = signal<DropdownOption[]>([]);
  users = signal<DropdownOption[]>([]);

  services = signal<ServiceInterface[]>([]);
  servicesCopy = signal<ServiceInterface[]>([]);
  loadingServices = signal(false);

  updatingSale = signal(false);
  updateSaleError = signal('');

  addingServiceUuid = signal<string | null>(null);
  addServiceError = signal('');

  addedServiceUuids = computed(() => {
    const details = this.currentSale()?.details ?? [];
    return new Set(details.map(d => d.service?.serviceuuid).filter((v): v is string => !!v));
  });

  showDeleteDetailForm = signal(false);
  deleteDetailTarget = signal<ResponseSaleDetailInterface | null>(null);
  deletingDetail = signal(false);
  removeDetailError = signal('');

  editingDetailUuid = signal<string | null>(null);
  savingDetail = signal(false);
  updateDetailError = signal('');

  editDetailForm = new FormGroup({
    saledetailamount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    saledetailquantity: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    saledetailcourtesy: new FormControl<boolean>(false, { nonNullable: true }),
  });

  showCustomerForm = signal(false);
  showServiceForm = signal(false);

  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  private saleService = inject(SaleService);
  private serviceService = inject(ServiceService);

  saleForm = new FormGroup({
    customeruuid: new FormControl<string>(''),
    useruuid: new FormControl<string>(''),
  });

  ngOnInit(): void {
    this.currentSale.set(this.sale());

    this.loadCustomers();
    this.loadUsers();
    this.loadServices();

    this.saleForm.patchValue({
      customeruuid: this.sale()?.customer?.customeruuid ?? '',
      useruuid: this.sale()?.user?.useruuid ?? '',
    }, { emitEvent: false });

    this.saleForm.valueChanges.subscribe(() => this.syncSaleFields());
  }

  private syncSaleFields() {
    const saleuuid = this.saleuuid();
    if (!saleuuid) return;
    const value = this.saleForm.getRawValue();
    const req: UpdateSaleRequestInterface = {
      branchuuid: this.currentSale()?.branch?.branchuuid ?? undefined,
      customeruuid: value.customeruuid || undefined,
      useruuid: value.useruuid || undefined,
    };
    this.updatingSale.set(true);
    this.updateSaleError.set('');
    this.saleService.updateSale(saleuuid, req).subscribe({
      next: (response) => {
        this.currentSale.set(response);
        this.saved.emit(response);
        this.updatingSale.set(false);
      },
      error: (error) => {
        console.error('Error updating sale:', error);
        this.updateSaleError.set('No se pudo actualizar la venta. Inténtalo nuevamente.');
        this.updatingSale.set(false);
      }
    });
  }

  isServiceAdded(service: ServiceInterface): boolean {
    return this.addedServiceUuids().has(service.serviceuuid);
  }

  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        const options = customers.map(customer => ({
          abv: customer.customeruuid,
          name: `${customer.customerfirstname} ${customer.customerlastname}`,
        }));
        this.customers.set(options);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        const options = users.map(user => ({
          abv: user.useruuid,
          name: `${user.userfirstname} ${user.userlastname}`,
        }));
        this.users.set(options);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  private loadServices(): void {
    this.loadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (services) => {
        const active = services.filter(s => s.servicestatus === 'active');
        this.services.set(active);
        this.servicesCopy.set(active);
        this.loadingServices.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.loadingServices.set(false);
      }
    });
  }

  onCatalogSearch(value: string) {
    const query = value.toLocaleLowerCase();
    this.servicesCopy.set(this.services().filter(s => s.servicename.toLocaleLowerCase().includes(query)));
  }

  addServiceToSale(service: ServiceInterface) {
    if (this.isServiceAdded(service)) return;
    this.addServiceError.set('');
    this.addingServiceUuid.set(service.serviceuuid);
    const req: SaleDetailRequestInterface = {
      serviceuuid: service.serviceuuid,
      saledetailamount: service.serviceprice,
      saledetailquantity: 1,
      saledetailcourtesy: false,
    };
    this.saleService.addSaleDetail(this.saleuuid(), req).subscribe({
      next: (response) => {
        this.currentSale.set(response);
        this.saved.emit(response);
        this.addingServiceUuid.set(null);
      },
      error: (error) => {
        console.error('Error adding service to sale:', error);
        this.addServiceError.set('No se pudo agregar el servicio a la venta. Inténtalo nuevamente.');
        this.addingServiceUuid.set(null);
      }
    });
  }

  openDeleteDetail(detail: ResponseSaleDetailInterface) {
    this.deleteDetailTarget.set(detail);
    this.removeDetailError.set('');
    this.showDeleteDetailForm.set(true);
  }

  onDeleteDetailCancelled() {
    this.showDeleteDetailForm.set(false);
    this.deleteDetailTarget.set(null);
  }

  onDeleteDetailConfirmed() {
    const detail = this.deleteDetailTarget();
    if (!detail) return;
    this.deletingDetail.set(true);
    this.removeDetailError.set('');
    this.saleService.removeSaleDetail(this.saleuuid(), detail.saledetailuuid).subscribe({
      next: (response) => {
        this.currentSale.set(response);
        this.saved.emit(response);
        this.deletingDetail.set(false);
        this.showDeleteDetailForm.set(false);
        this.deleteDetailTarget.set(null);
      },
      error: (error) => {
        console.error('Error removing service from sale:', error);
        this.removeDetailError.set('No se pudo quitar el servicio de la venta. Inténtalo nuevamente.');
        this.deletingDetail.set(false);
      }
    });
  }

  startEditDetail(detail: ResponseSaleDetailInterface) {
    this.updateDetailError.set('');
    this.editDetailForm.setValue({
      saledetailamount: detail.saledetailamount,
      saledetailquantity: detail.saledetailquantity,
      saledetailcourtesy: detail.saledetailcourtesy,
    });
    this.editingDetailUuid.set(detail.saledetailuuid);
  }

  cancelEditDetail() {
    this.editingDetailUuid.set(null);
  }

  saveEditDetail(detail: ResponseSaleDetailInterface) {
    this.editDetailForm.markAllAsTouched();
    if (this.editDetailForm.invalid) return;
    const value = this.editDetailForm.getRawValue();
    const dto: UpdateSaleDetailDto = {
      saledetailamount: value.saledetailamount,
      saledetailquantity: value.saledetailquantity,
      saledetailcourtesy: value.saledetailcourtesy,
    };
    this.savingDetail.set(true);
    this.updateDetailError.set('');
    this.saleService.updateSaleDetail(this.saleuuid(), detail.saledetailuuid, dto).subscribe({
      next: (response) => {
        this.currentSale.set(response);
        this.saved.emit(response);
        this.savingDetail.set(false);
        this.editingDetailUuid.set(null);
      },
      error: (error) => {
        console.error('Error updating sale detail:', error);
        this.updateDetailError.set('No se pudo actualizar el servicio. Inténtalo nuevamente.');
        this.savingDetail.set(false);
      }
    });
  }

  openCreateCustomer() {
    this.showCustomerForm.set(true);
  }

  onCustomerCreated(customer: CustomersInterface) {
    this.customers.update(cs => [{ abv: customer.customeruuid, name: `${customer.customerfirstname} ${customer.customerlastname}` }, ...cs]);
    this.saleForm.get('customeruuid')?.setValue(customer.customeruuid);
    this.showCustomerForm.set(false);
  }

  onCustomerFormClosed() {
    this.showCustomerForm.set(false);
  }

  openCreateService() {
    this.showServiceForm.set(true);
  }

  onServiceCreated(service: ServiceInterface) {
    this.services.update(ss => [service, ...ss]);
    this.servicesCopy.update(ss => [service, ...ss]);
    this.showServiceForm.set(false);
  }

  onServiceFormClosed() {
    this.showServiceForm.set(false);
  }

  close() {
    this.closed.emit();
  }
}
