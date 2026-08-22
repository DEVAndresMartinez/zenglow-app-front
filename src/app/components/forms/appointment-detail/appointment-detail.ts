import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { UIConfirmModalComponent } from '../../shared/ui/ui-confirm-modal/ui-confirm-modal';
import { AppointmentsService } from '../../../core/services/modules/appointment.service';
import { ServiceService } from '../../../core/services/modules/service.service';
import { AppointmentDetialResponseInterface, AppointmentResponseInterface, CreateAppointmentDetailInterface, FinalizeAppointmentInterface, SaleType } from '../../../core/interfaces/appointment.interface';
import { ServiceInterface } from '../../../core/interfaces/service.interface';
import { SaleResponseInterface } from '../../../core/interfaces/sale.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';
import { PaymentSaleForm } from '../payment-sale-form/payment-sale-form';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-warning/15 text-warning-hover border border-warning-soft shadow-sm' },
  confirmed: { label: 'Confirmada', classes: 'bg-primary/15 text-primary border border-primary/30 shadow-sm' },
  completed: { label: 'Completada', classes: 'bg-accent/15 text-accent-hover border border-accent-soft shadow-sm' },
  cancelled: { label: 'Cancelada', classes: 'bg-error/15 text-error border border-error/30 shadow-sm' },
  'no-show': { label: 'No asistió', classes: 'bg-stroke/40 text-muted border border-stroke shadow-sm' },
};

const MODE_LABELS: Record<string, string> = {
  at_branch: 'En sucursal',
  delivered: 'A domicilio',
};

const BLOCKED_STATUSES = ['completed', 'cancelled'];

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent, UIInputComponent, UIConfirmModalComponent, PaymentSaleForm],
  templateUrl: './appointment-detail.html',
})
export class AppointmentDetail implements OnInit {

  appointment = input.required<AppointmentResponseInterface>();

  updated = output<AppointmentResponseInterface>();
  closed = output();

  currentAppointment = signal<AppointmentResponseInterface | null>(null);

  services = signal<ServiceInterface[]>([]);
  loadingServices = signal(false);

  showAddDetail = signal(false);
  addingDetail = signal(false);
  addDetailError = signal('');
  addDetailForm: FormGroup = new FormGroup({
    serviceuuid: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    appointmentdetailamount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    appointmentdetailduration: new FormControl<number | null>(null),
  });

  showRemoveDetailConfirm = signal(false);
  removeDetailTarget = signal<AppointmentDetialResponseInterface | null>(null);
  removingDetail = signal(false);
  removeDetailError = signal('');

  statusUpdating = signal(false);
  statusError = signal('');

  showCancelConfirm = signal(false);
  cancellingAppointment = signal(false);
  cancelError = signal('');

  showFinalizeConfirm = signal(false);
  finalizing = signal(false);
  finalizeError = signal('');

  showPaymentForm = signal(false);
  finalizedSale = signal<SaleResponseInterface | null>(null);

  private appointmentsService = inject(AppointmentsService);
  private serviceService = inject(ServiceService);

  ngOnInit(): void {
    this.currentAppointment.set(this.appointment());
  }

  get canManageDetails(): boolean {
    return !BLOCKED_STATUSES.includes(this.currentAppointment()!.appointmentstatus);
  }

  get canCancel(): boolean {
    const status = this.currentAppointment()!.appointmentstatus;
    return status === 'pending' || status === 'confirmed';
  }

  get canConfirm(): boolean {
    return this.currentAppointment()!.appointmentstatus === 'pending';
  }

  get canMarkNoShow(): boolean {
    const status = this.currentAppointment()!.appointmentstatus;
    return status === 'pending' || status === 'confirmed';
  }

  get canFinalize(): boolean {
    const status = this.currentAppointment()!.appointmentstatus;
    return status === 'pending' || status === 'confirmed';
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['pending'];
  }

  modeLabel(mode: string): string {
    return MODE_LABELS[mode] ?? mode;
  }

  getCustomerName(appointment: AppointmentResponseInterface): string {
    if (appointment.customer) return `${appointment.customer.customerfirstname} ${appointment.customer.customerlastname}`;
    if (appointment.appointmentcustomername) return appointment.appointmentcustomername;
    return 'Sin cliente asignado';
  }

  getUserName(appointment: AppointmentResponseInterface): string {
    if (appointment.user) return `${appointment.user.userfirstname} ${appointment.user.userlastname}`;
    return 'Sin profesional asignado';
  }

  close() {
    this.closed.emit();
  }

  private applyUpdate(appointment: AppointmentResponseInterface) {
    this.currentAppointment.set(appointment);
    this.updated.emit(appointment);
  }

  // --- Servicios (detalles) ---

  openAddDetail() {
    this.addDetailError.set('');
    this.addDetailForm.reset({ serviceuuid: '', appointmentdetailamount: null, appointmentdetailduration: null });
    this.showAddDetail.set(true);
    if (this.services().length === 0) this.loadServices();
  }

  private loadServices() {
    this.loadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        this.services.set(res.filter(s => s.servicestatus === 'active'));
        this.loadingServices.set(false);
      },
      error: () => { this.loadingServices.set(false); },
    });
  }

  get serviceOptions(): DropdownOption[] {
    return this.services().map(s => ({ abv: s.serviceuuid, name: s.servicename }));
  }

  onServiceSelected(selection: DropdownOption | DropdownOption[] | null) {
    const abv = Array.isArray(selection) ? '' : (selection?.abv ?? '');
    const service = this.services().find(s => s.serviceuuid === abv);
    if (service) {
      this.addDetailForm.patchValue({
        appointmentdetailamount: service.serviceprice,
        appointmentdetailduration: service.serviceduration,
      });
    }
  }

  cancelAddDetail() {
    this.showAddDetail.set(false);
  }

  submitAddDetail() {
    this.addDetailForm.markAllAsTouched();
    if (this.addDetailForm.invalid) return;

    const v = this.addDetailForm.value;
    const dto: CreateAppointmentDetailInterface = {
      serviceuuid: v.serviceuuid,
      appointmentdetailamount: v.appointmentdetailamount,
      appointmentdetailduration: v.appointmentdetailduration ?? undefined,
    };

    this.addingDetail.set(true);
    this.addDetailError.set('');
    this.appointmentsService.addDetail(this.currentAppointment()!.appointmentuuid, dto).subscribe({
      next: (response) => {
        this.applyUpdate(response);
        this.addingDetail.set(false);
        this.showAddDetail.set(false);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.addDetailError.set(body?.message || 'No se pudo agregar el servicio a la cita. Inténtalo nuevamente.');
        this.addingDetail.set(false);
      },
    });
  }

  openRemoveDetail(detail: AppointmentDetialResponseInterface) {
    this.removeDetailTarget.set(detail);
    this.removeDetailError.set('');
    this.showRemoveDetailConfirm.set(true);
  }

  onRemoveDetailCancelled() {
    this.showRemoveDetailConfirm.set(false);
    this.removeDetailTarget.set(null);
  }

  onRemoveDetailConfirmed() {
    const detail = this.removeDetailTarget();
    if (!detail) return;
    this.removingDetail.set(true);
    this.removeDetailError.set('');
    this.appointmentsService.removeDetail(this.currentAppointment()!.appointmentuuid, detail.appointmentdetailuuid).subscribe({
      next: (response) => {
        this.applyUpdate(response);
        this.removingDetail.set(false);
        this.showRemoveDetailConfirm.set(false);
        this.removeDetailTarget.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.removeDetailError.set(body?.message || 'No se pudo quitar el servicio de la cita. Inténtalo nuevamente.');
        this.removingDetail.set(false);
      },
    });
  }

  // --- Estado de la cita ---

  quickStatusChange(status: 'confirmed' | 'no-show') {
    this.statusUpdating.set(true);
    this.statusError.set('');
    this.appointmentsService.changeStatus(this.currentAppointment()!.appointmentuuid, { appointmentstatus: status }).subscribe({
      next: () => {
        this.applyUpdate({ ...this.currentAppointment()!, appointmentstatus: status });
        this.statusUpdating.set(false);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.statusError.set(body?.message || 'No se pudo actualizar el estado de la cita. Inténtalo nuevamente.');
        this.statusUpdating.set(false);
      },
    });
  }

  openCancelAppointment() {
    this.cancelError.set('');
    this.showCancelConfirm.set(true);
  }

  onCancelDismissed() {
    this.showCancelConfirm.set(false);
  }

  onCancelConfirmed() {
    this.cancellingAppointment.set(true);
    this.cancelError.set('');
    this.appointmentsService.changeStatus(this.currentAppointment()!.appointmentuuid, { appointmentstatus: 'cancelled' }).subscribe({
      next: () => {
        this.applyUpdate({ ...this.currentAppointment()!, appointmentstatus: 'cancelled' });
        this.cancellingAppointment.set(false);
        this.showCancelConfirm.set(false);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.cancelError.set(body?.message || 'No se pudo cancelar la cita. Inténtalo nuevamente.');
        this.cancellingAppointment.set(false);
      },
    });
  }

  // --- Finalizar (queda completada y se abre el pago) ---

  openFinalize() {
    this.finalizeError.set('');
    this.showFinalizeConfirm.set(true);
  }

  onFinalizeCancelled() {
    this.showFinalizeConfirm.set(false);
  }

  onFinalizeConfirmed() {
    this.finalizing.set(true);
    this.finalizeError.set('');

    const dto: FinalizeAppointmentInterface = {
      saletype: SaleType.COMP,
      saletip: 0,
    };

    this.appointmentsService.finalize(this.currentAppointment()!.appointmentuuid, dto).subscribe({
      next: (sale) => {
        this.finalizing.set(false);
        this.showFinalizeConfirm.set(false);
        this.finalizedSale.set(sale);
        this.applyUpdate({ ...this.currentAppointment()!, appointmentstatus: 'completed' });
        this.showPaymentForm.set(true);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.finalizeError.set(body?.message || 'No se pudo finalizar la cita. Inténtalo nuevamente.');
        this.finalizing.set(false);
      },
    });
  }

  onPaymentFormClosed() {
    this.showPaymentForm.set(false);
    this.finalizedSale.set(null);
  }

}
