import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { CustomerService } from '../../../core/services/modules/customer.service';
import { CustomersInterface } from '../../../core/interfaces/customer.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { CustomerForm } from '../../../components/forms/customer-form/customer-form';

const CUSTOMER_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activo', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactivo', classes: 'bg-stroke/40 text-muted border-stroke' },
  blocked: { label: 'Bloqueado', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  deleted: { label: 'Eliminado', classes: 'bg-error/10 text-error border-error/30' },
};

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, UISearchComponent, CustomerForm],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {

  private customerService = inject(CustomerService);

  customers = signal<CustomersInterface[]>([]);
  customersCopy = signal<CustomersInterface[]>([]);

  loading = signal<boolean>(true);
  showCustomerForm = signal<boolean>(false);
  editCustomer = signal<CustomersInterface | null>(null);

  constructor() {
    effect(() => {
      this.getCustomers();
    });
  }

  openCreateCustomer() {
    this.editCustomer.set(null);
    this.showCustomerForm.set(true);
  }

  openEditCustomer(customer: CustomersInterface) {
    this.editCustomer.set(customer);
    this.showCustomerForm.set(true);
  }

  onCustomerSaved(customer: CustomersInterface) {
    if (this.editCustomer() !== null) {
      this.customers.update(cs => cs.map(c => c.customeruuid === customer.customeruuid ? customer : c));
      this.customersCopy.update(cs => cs.map(c => c.customeruuid === customer.customeruuid ? customer : c));
    } else {
      this.customers.update(cs => [customer, ...cs]);
      this.customersCopy.update(cs => [customer, ...cs]);
    }
  }

  onCustomerFormClosed() {
    this.showCustomerForm.set(false);
    this.editCustomer.set(null);
  }

  customerStatusConfig(status: string) {
    return CUSTOMER_STATUS_MAP[status] ?? CUSTOMER_STATUS_MAP['inactive'];
  }

  getCustomers() {
    this.loading.set(true);
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers.set(response);
        this.customersCopy.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
        this.loading.set(false);
      }
    });
  }

  onGlobalFilter(value: string) {
    this.customersCopy.set(this.customers().filter((customer) => {
      const searchValue = value.toLowerCase();
      return (
        customer.customerfirstname.toLowerCase().includes(searchValue) ||
        customer.customerlastname.toLowerCase().includes(searchValue) ||
        customer.customeremail.toLowerCase().includes(searchValue) ||
        customer.customerphone.toLowerCase().includes(searchValue) ||
        customer.customerbirthdate?.toLowerCase().includes(searchValue) ||
        customer.customercity?.toLowerCase().includes(searchValue) ||
        customer.customerdocumentnumber.toLowerCase().includes(searchValue) ||
        customer.customerdocumenttype.toLowerCase().includes(searchValue) ||
        customer.customerstatus.toLowerCase().includes(searchValue)
      );
    }));
  }
}
