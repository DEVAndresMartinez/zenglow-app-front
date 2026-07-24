import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CreatePayment, SaleResponseInterface } from '../../../core/interfaces/sale.interface';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { AirtableService } from '../../../core/services/integrations/airtable.service';
import { SaleService } from '../../../core/services/modules/sale.service';
import { UIConfirmModalComponent } from '../../shared/ui/ui-confirm-modal/ui-confirm-modal';

const STATUS_LABELS: Record<string, string> = {
  pending: 'pending',
  in_progress: 'in-progress',
  padi: 'paid',
  rejected: 'rejected',
  cancelled: 'cancelled'
}

// const PAYMENT_METHODS: Record<string, string> = {
//   efectivo: 'efectivo',
//   llave: 'llave',
//   nequi: 'nequi',
//   daviplata: 'daviplata',
//   pse: 'pse',
//   qr: 'qr',
//   card: 'card',
//   transfer: 'transfer',
//   mixed: 'mixed',
// }

const PROVIDER: Record<string, string> = {
  manual: 'manual',
  wompi: 'wompi',
  bold: 'bold',
  ePayco: 'ePayco',
  MercadoPago: 'MercadoPago',
}

@Component({
  selector: 'app-payment-sale-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIConfirmModalComponent],
  templateUrl: './payment-sale-form.html',
  styleUrl: './payment-sale-form.scss',
})
export class PaymentSaleForm {

  saleuuid = input<string>('');
  salependingamount = input<number>(0);
  salesequence = input<string>('');

  saved = output<SaleResponseInterface>();
  closed = output();

  sent = signal<boolean>(false);
  loading = signal<boolean>(false);
  loadingMethods = signal<boolean>(false);
  error = signal<string>('');

  showConfirmPay = signal<boolean>(false);
  paidSale = signal<SaleResponseInterface | null>(null);

  paymentForm: FormGroup = new FormGroup({
    paymentprovider: new FormControl<string>('manual', { validators: [Validators.required] }),
    paymentmethod: new FormControl<string>('efectivo', { validators: [Validators.required] }),
    paymentamount: new FormControl<number>(0, { validators: [Validators.required] }),
    paymentstatus: new FormControl<string>('pending', { validators: [Validators.required] })
  });

  private saleService = inject(SaleService);
  readonly airtableService = inject(AirtableService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loadPaymentMethods();
    this.loading.set(false);
    this.paymentForm.patchValue({
      paymentprovider: 'manual',
      paymentamount: this.salependingamount()
    });
  }

  get priceError(): string {
    if (!this.sent()) return '';
    const ctrl = this.paymentForm.get('paymentamount');
    if (ctrl?.errors?.['required']) return 'El precio es requerido';
    if (ctrl?.errors?.['min']) return 'Debe ser mayor o igual a 0';
    if (ctrl?.value > this.salependingamount()) return 'Debe ser menor o igual al saldo pendiente';
    return '';
  }

  loadPaymentMethods() {
    if (this.airtableService.paymentMethods().length === 0) {
      this.loadingMethods.set(true);
      this.airtableService.getPaymentMethods().subscribe({
        next: (res) => {
          this.airtableService.paymentMethods.set(res.sort((a, b) => a.methodorder - b.methodorder));
          this.loadingMethods.set(false);
        }, error: (error) => {
          this.loadingMethods.set(false);
        }
      })
    }
  }

  isMethodAvailable(status: string): boolean {
    return status === 'Disponible';
  }

  get confirmPayAmount(): number {
    return this.paymentForm.get('paymentamount')?.value ?? 0;
  }

  get confirmPayRemaining(): number {
    return Math.max(this.salependingamount() - this.confirmPayAmount, 0);
  }

  get confirmPayMessage(): string {
    const method = this.airtableService.paymentMethods().find(m => m.methodslug === this.paymentForm.get('paymentmethod')?.value);
    const methodName = method?.methodname ?? '';
    if (this.confirmPayRemaining === 0) {
      return `Vas a registrar un pago con ${methodName} que completa el total de la venta. Esta acción no se puede deshacer.`;
    }
    return `Vas a registrar un pago parcial con ${methodName}. Esta acción no se puede deshacer.`;
  }

  get saleCompleted(): boolean {
    return this.paidSale()?.salependingamount === 0;
  }

  requestPay() {
    this.sent.set(true);
    if (this.paymentForm.invalid || this.priceError) return;
    this.error.set('');
    this.showConfirmPay.set(true);
  }

  cancelPay() {
    this.showConfirmPay.set(false);
  }

  confirmPay() {
    this.loading.set(true);
    this.error.set('');

    const payment: CreatePayment = {
      paymentprovider: this.paymentForm.value.paymentprovider,
      paymentmethod: this.paymentForm.value.paymentmethod,
      paymentamount: this.paymentForm.value.paymentamount,
      paymentstatus: this.paymentForm.value.paymentprovider === 'manual' ? 'paid' : 'pending',
    };

    this.saleService.addPayment(this.saleuuid(), payment).subscribe({
      next: (sale) => {
        this.loading.set(false);
        this.showConfirmPay.set(false);
        this.paidSale.set(sale);
      },
      error: (err) => {
        this.loading.set(false);
        this.showConfirmPay.set(false);
        this.error.set(err?.error?.message ?? 'Ocurrió un error al procesar el pago.');
      }
    });
  }

  acceptSuccess() {
    const sale = this.paidSale();
    if (sale) this.saved.emit(sale);
    this.close();
  }

  close() {
    this.closed.emit();
  }

}
