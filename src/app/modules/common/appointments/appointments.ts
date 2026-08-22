import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { DropdownOption, UIDropdownComponent } from '../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';
import { AppointmentForm } from '../../../components/forms/appointment-form/appointment-form';
import { AppointmentDetail } from '../../../components/forms/appointment-detail/appointment-detail';
import { AppointmentsService } from '../../../core/services/modules/appointment.service';
import { BranchService } from '../../../core/services/modules/branch.service';
import { AppointmentResponseInterface } from '../../../core/interfaces/appointment.interface';

const APPOINTMENT_STATUS_MAP: Record<string, { label: string; classes: string }> = {
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

const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { abv: 'pending', name: 'Pendiente' },
  { abv: 'confirmed', name: 'Confirmada' },
  { abv: 'completed', name: 'Completada' },
  { abv: 'cancelled', name: 'Cancelada' },
  { abv: 'no-show', name: 'No asistió' },
];

const BLOCKED_STATUSES = ['completed', 'cancelled'];

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UISearchComponent, UIDropdownComponent, UIInputComponent, AppointmentForm, AppointmentDetail],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
})
export class Appointments {

  private appointmentsService = inject(AppointmentsService);
  private branchService = inject(BranchService);

  appointments = signal<AppointmentResponseInterface[]>([]);
  appointmentsCopy = signal<AppointmentResponseInterface[]>([]);
  loading = signal(true);

  branches = signal<DropdownOption[]>([]);
  statusOptions = STATUS_FILTER_OPTIONS;

  searchValue = signal('');
  branchFilter = signal('');
  statusFilter = signal('');
  dateFilter = signal('');

  showForm = signal(false);
  isEditForm = signal(false);
  editAppointment = signal<AppointmentResponseInterface | null>(null);

  showDetail = signal(false);
  selectedAppointment = signal<AppointmentResponseInterface | null>(null);

  constructor() {
    this.loadBranches();
    this.getAppointments();
  }

  private loadBranches() {
    this.branchService.getBranches().subscribe({
      next: (res) => this.branches.set(res.map(b => ({ abv: b.branchuuid, name: b.branchname }))),
      error: () => { },
    });
  }

  getAppointments() {
    this.loading.set(true);
    const branchuuid = this.branchFilter();
    const request = branchuuid
      ? this.appointmentsService.findAllByBranch(branchuuid)
      : this.appointmentsService.findAll();

    request.subscribe({
      next: (response) => {
        this.appointments.set(response);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  private singleOptionValue(selection: DropdownOption | DropdownOption[] | null): string {
    return Array.isArray(selection) ? '' : (selection?.abv ?? '');
  }

  onBranchFilterChange(selection: DropdownOption | DropdownOption[] | null) {
    this.branchFilter.set(this.singleOptionValue(selection));
    this.getAppointments();
  }

  onStatusFilterChange(selection: DropdownOption | DropdownOption[] | null) {
    this.statusFilter.set(this.singleOptionValue(selection));
    this.applyFilters();
  }

  onDateFilterChange(value: string) {
    this.dateFilter.set(value);
    this.applyFilters();
  }

  onGlobalFilter(value: string) {
    this.searchValue.set(value);
    this.applyFilters();
  }

  private applyFilters() {
    const search = this.searchValue().toLocaleLowerCase();
    const status = this.statusFilter();
    const date = this.dateFilter();

    this.appointmentsCopy.set(this.appointments().filter(a => {
      const matchesSearch = !search
        || this.getCustomerName(a).toLocaleLowerCase().includes(search)
        || this.getUserName(a).toLocaleLowerCase().includes(search)
        || (a.appointmentcustomerphone ?? '').toLocaleLowerCase().includes(search)
        || (a.branch?.branchname ?? '').toLocaleLowerCase().includes(search);
      const matchesStatus = !status || a.appointmentstatus === status;
      const matchesDate = !date || a.appointmentdate === date;
      return matchesSearch && matchesStatus && matchesDate;
    }));
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

  modeLabel(mode: string): string {
    return MODE_LABELS[mode] ?? mode;
  }

  statusConfig(status: string) {
    return APPOINTMENT_STATUS_MAP[status] ?? APPOINTMENT_STATUS_MAP['pending'];
  }

  canEdit(appointment: AppointmentResponseInterface): boolean {
    return !BLOCKED_STATUSES.includes(appointment.appointmentstatus);
  }

  openCreate() {
    this.isEditForm.set(false);
    this.editAppointment.set(null);
    this.showForm.set(true);
  }

  openEdit(appointment: AppointmentResponseInterface) {
    if (!this.canEdit(appointment)) return;
    this.isEditForm.set(true);
    this.editAppointment.set(appointment);
    this.showForm.set(true);
  }

  onAppointmentSaved(appointment: AppointmentResponseInterface) {
    if (this.isEditForm()) {
      this.appointments.update(as => as.map(a => a.appointmentuuid === appointment.appointmentuuid ? appointment : a));
    } else {
      this.appointments.update(as => [appointment, ...as]);
    }
    this.applyFilters();
  }

  onFormClosed() {
    this.showForm.set(false);
    this.editAppointment.set(null);
  }

  openDetail(appointment: AppointmentResponseInterface) {
    this.selectedAppointment.set(appointment);
    this.showDetail.set(true);
  }

  onAppointmentUpdated(appointment: AppointmentResponseInterface) {
    this.selectedAppointment.set(appointment);
    this.appointments.update(as => as.map(a => a.appointmentuuid === appointment.appointmentuuid ? appointment : a));
    this.applyFilters();
  }

  onDetailClosed() {
    this.showDetail.set(false);
    this.selectedAppointment.set(null);
  }

}
