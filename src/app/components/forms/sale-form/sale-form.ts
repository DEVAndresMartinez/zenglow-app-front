import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SaleResponseInterface } from '../../../core/interfaces/sale.interface';
import { CustomerService } from '../../../core/services/modules/customer.service';
import { UserService } from '../../../core/services/modules/user.service';
import { CommerceService } from '../../../core/services/modules/commerce.service';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  'paid-partial': 'Pago Parcial',
  paid: 'Pagado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss',
})
export class SaleForm {

  isEdit = input(false);
  saleuuid = input<string>('');
  sale = input<SaleResponseInterface | null>(null);

  saved = output<SaleResponseInterface>();
  closed = output();

  responseSale = signal<SaleResponseInterface | null>(null);
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  customers = signal<DropdownOption[]>([]);
  users = signal<DropdownOption[]>([]);

  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  readonly commerceService = inject(CommerceService);

  saleForm = new FormGroup({
    branchuuid: new FormControl<string>(''),
    customeruuid: new FormControl<string>(''),
    useruuid: new FormControl<string>(''),
  });

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);
    this.loadUsers();
    this.loadCustomers();

    this.saleForm.patchValue({
      branchuuid: this.commerceService.me()?.user.branch?.branchuuid ?? '',
      useruuid: this.commerceService.me()?.user.useruuid ?? '',
    });

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


}
