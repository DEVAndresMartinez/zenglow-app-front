import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { SaleService } from '../../../core/services/modules/sale.service';
import { SaleRequestInterface, SaleResponseInterface } from '../../../core/interfaces/sale.interface';
import { CommerceService } from '../../../core/services/modules/commerce.service';

const SALE_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-warning/15 text-warning-hover border border-warning-soft shadow-sm' },
  'paid-partial': { label: 'Inactivo', classes: 'bg-stroke/40 text-muted border border-stroke shadow-sm' },
  paid: { label: 'Bloqueado', classes: 'bg-accent/15 text-accent-hover border border-accent-soft shadow-sm' },
  cancelled: { label: 'Eliminado', classes: 'bg-error/15 text-error border border-error/30 shadow-sm' },
  refunded: { label: 'Reembolsado', classes: 'bg-primary/15 text-primary border border-primary/30 shadow-sm' },
};

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, UISearchComponent],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales {

  private saleService = inject(SaleService);
  readonly commerceService = inject(CommerceService);

  sales = signal<SaleResponseInterface[]>([]);
  salesCopy = signal<SaleResponseInterface[]>([]);

  loading = signal<boolean>(true);

  constructor() {
    this.getSales();
  }

  getSales() {
    this.loading.set(true);
    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.salesCopy.set(sales);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching sales:', error);
        this.loading.set(false);
      }
    });
  }

  onGlobalFilter(value: string) {
    this.salesCopy.set(this.sales().filter((sale) => {
      const searchValue = value.toLowerCase();
      return (
        sale.customer?.customerfirstname.toLowerCase().includes(searchValue) ||
        sale.customer?.customerlastname.toLowerCase().includes(searchValue) ||
        sale.customer?.customeremail.toLowerCase().includes(searchValue) ||
        sale.customer?.customerphone.toLowerCase().includes(searchValue) ||
        sale.user?.userfirstname.toLowerCase().includes(searchValue) ||
        sale.user?.userlastname.toLowerCase().includes(searchValue) ||
        sale.user?.useremail.toLowerCase().includes(searchValue) ||
        sale.user?.userphone.toLowerCase().includes(searchValue) ||
        sale.salesequence.toLowerCase().includes(searchValue) ||
        sale.saletype.toLowerCase().includes(searchValue) ||
        sale.salestatus.toLowerCase().includes(searchValue)
      );
    }));
  }

  onStatusFilter(value: string) {
    this.salesCopy.set(this.sales().filter((sale) => {
      const searchValue = value.toLowerCase();
      return (
        sale.salestatus.toLowerCase().includes(searchValue)
      );
    }));
  }

  onTypeFilter(value: string) {
    this.salesCopy.set(this.sales().filter((sale) => {
      const searchValue = value.toLowerCase();
      return (
        sale.saletype.toLowerCase().includes(searchValue)
      );
    }));
  }

  getCustomername(sale: SaleResponseInterface): string {
    if (sale.customer) {
      return `${sale.customer.customerfirstname} ${sale.customer.customerlastname}`;
    }
    return 'Sin cliente asignado';
  }

  getUserName(sale: SaleResponseInterface): string {
    if (sale.user) {
      return `${sale.user.userfirstname} ${sale.user.userlastname}`;
    }
    return 'Sin profesional asignado';
  }

  getStatusConfig(status: string) {
    return SALE_STATUS_MAP[status] ?? SALE_STATUS_MAP['pending'];
  }

  startSale() {
    const sale: SaleRequestInterface = {
      branchuuid: this.commerceService.me()?.user.branch?.branchuuid ?? '',
      useruuid: this.commerceService.me()?.user.useruuid ?? '',
      saledeliveryfee: 0,
      saletip: 0,
      salestatus: 'pending',
      saletype: 'COMP',
    };
    this.saleService.createSale(sale).subscribe({
      next: (newSale) => {
        this.sales.update(sales => [newSale, ...sales]);
        this.salesCopy.update(sales => [newSale, ...sales]);
      },
      error: (error) => {
        console.error('Error creating sale:', error);
      }
    });
  }
}
