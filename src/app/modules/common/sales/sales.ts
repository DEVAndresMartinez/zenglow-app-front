import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { SaleForm } from '../../../components/forms/sale-form/sale-form';
import { SaleService } from '../../../core/services/modules/sale.service';
import { CreatePaymentForm, PaymentSaleResponseInterface, SaleRequestInterface, SaleResponseInterface } from '../../../core/interfaces/sale.interface';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { PaymentSaleForm } from '../../../components/forms/payment-sale-form/payment-sale-form';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';

const SALE_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-warning/15 text-warning-hover border border-warning-soft shadow-sm' },
  'paid-partial': { label: 'Pago parcial', classes: 'bg-primary/30 text-primary border border-primary/20 shadow-sm' },
  paid: { label: 'Finalizada', classes: 'bg-accent/15 text-accent-hover border border-accent-soft shadow-sm' },
  cancelled: { label: 'Eliminado', classes: 'bg-error/15 text-error border border-error/30 shadow-sm' },
  refunded: { label: 'Reembolsado', classes: 'bg-primary/15 text-primary border border-primary/30 shadow-sm' },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  llave: 'Llave',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  pse: 'PSE',
  qr: 'QR',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  mixed: 'Mixto',
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-warning/15 text-warning-hover border border-warning-soft shadow-sm' },
  'in-progress': { label: 'En proceso', classes: 'bg-primary/15 text-primary border border-primary/30 shadow-sm' },
  paid: { label: 'Pagado', classes: 'bg-accent/15 text-accent-hover border border-accent-soft shadow-sm' },
  rejected: { label: 'Rechazado', classes: 'bg-error/15 text-error border border-error/30 shadow-sm' },
  cancelled: { label: 'Cancelado', classes: 'bg-stroke/40 text-muted border border-stroke shadow-sm' },
};

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, UISearchComponent, SaleForm, PaymentSaleForm, UIInputComponent],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales {

  private saleService = inject(SaleService);
  readonly commerceService = inject(CommerceService);

  sales = signal<SaleResponseInterface[]>([]);
  salesCopy = signal<SaleResponseInterface[]>([]);

  loading = signal<boolean>(true);

  showEditSaleForm = signal(false);
  editSale = signal<SaleResponseInterface | null>(null);

  showPaymentForm = signal(false);
  addPay = signal<CreatePaymentForm | null>(null);

  showDetailSale = signal(false);

  selectedSale = signal<SaleResponseInterface | null>(null);
  payments = signal<PaymentSaleResponseInterface[]>([]);
  loadingPayments = signal(false);

  dateFilter = signal('');

  constructor() {
    this.getSales();
    const today = new Date();
    this.dateFilter.set(today.toISOString().slice(0, 10));
  }

  getSales() {
    this.loading.set(true);
    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.salesCopy.set(sales);
        this.onFilterSaleDate(this.dateFilter());
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

  onEditSale(sale: SaleResponseInterface) {
    this.editSale.set(sale);
    this.showEditSaleForm.set(true);
  }

  onSaleUpdated(sale: SaleResponseInterface) {
    this.sales.update(ss => ss.map(s => s.saleuuid === sale.saleuuid ? sale : s));
    this.salesCopy.update(ss => ss.map(s => s.saleuuid === sale.saleuuid ? sale : s));
    this.editSale.set(sale);
  }

  onEditSaleFormClosed() {
    this.showEditSaleForm.set(false);
    this.editSale.set(null);
  }

  onPaymentSale(sale: SaleResponseInterface) {
    this.addPay.set(sale);
    this.showPaymentForm.set(true);
  }

  onPaymentSaleClosed() {
    this.addPay.set(null);
    this.showPaymentForm.set(false);
  }

  onDetailSale(sale: SaleResponseInterface) {
    this.selectedSale.set(sale);
    this.showDetailSale.set(true);
    this.loadingPayments.set(true);
    this.saleService.getPayments(sale.saleuuid).subscribe({
      next: (res) => {
        this.payments.set(res);
        this.loadingPayments.set(false);
      }, error: (error: any) => {
        if (error.error.error === 'NOT_FOUND_PAYMENT') {
          this.payments.set([]);
        }
        this.loadingPayments.set(false);
      }
    });
  }

  onFilterSaleDate(date: string) {
    this.dateFilter.set(date);
    this.salesCopy.set(this.sales().filter((sale) => {
      return (
        sale.created_at.toString().includes(date)
      );
    }));
  }

  onDetailSaleClosed() {
    this.showDetailSale.set(false);
    this.selectedSale.set(null);
    this.payments.set([]);
  }

  getPaymentMethodLabel(method: string): string {
    return PAYMENT_METHOD_LABELS[method] ?? method;
  }

  getPaymentStatusConfig(status: string) {
    return PAYMENT_STATUS_MAP[status] ?? PAYMENT_STATUS_MAP['pending'];
  }

}
