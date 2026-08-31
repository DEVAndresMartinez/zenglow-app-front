import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, combineLatest, debounceTime, forkJoin, of, startWith } from 'rxjs';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { UISearchComponent } from '../../shared/ui/ui-search-component/ui-search-component';
import { AppointmentsService } from '../../../core/services/modules/appointment.service';
import { BranchService } from '../../../core/services/modules/branch.service';
import { CustomerService } from '../../../core/services/modules/customer.service';
import { UserService } from '../../../core/services/modules/user.service';
import { ServiceService } from '../../../core/services/modules/service.service';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { ScheduleService } from '../../../core/services/modules/schedule.service';
import { LicenseService } from '../../../core/services/modules/license.service';
import { CreateAppointmentInterface, AppointmentResponseInterface, UpdateAppointmentInterface } from '../../../core/interfaces/appointment.interface';
import { ServiceInterface } from '../../../core/interfaces/service.interface';
import { CustomersInterface } from '../../../core/interfaces/customer.interface';
import { ResponseSchedule } from '../../../core/interfaces/schedule.interface';
import { ResponseLicense } from '../../../core/interfaces/license.interface';
import { CITIES } from '../../../core/const/cities';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';
import { CustomerForm } from '../customer-form/customer-form';

type CustomerMode = 'existing' | 'manual';

interface PendingDetail {
  serviceuuid: string;
  servicename: string;
  appointmentdetailamount: number;
  appointmentdetailduration: number;
}

type AvailabilityStatus = 'free' | 'incomplete' | 'loading' | 'available' | 'unavailable' | 'unknown';

interface AvailabilityState {
  status: AvailabilityStatus;
  reason?: string;
}

const MODE_OPTIONS: DropdownOption[] = [
  { abv: 'at_branch', name: 'En sucursal' },
  { abv: 'delivered', name: 'A domicilio' },
];

const BLOCKED_STATUSES = ['completed', 'cancelled'];

// Date.getDay(): 0 = domingo ... 6 = sábado.
const DAY_OF_WEEK_BY_INDEX: ResponseSchedule['scheduledayofweek'][] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

const DAY_LABELS: Record<string, string> = {
  Monday: 'lunes', Tuesday: 'martes', Wednesday: 'miércoles', Thursday: 'jueves',
  Friday: 'viernes', Saturday: 'sábado', Sunday: 'domingo',
};

// Acepta "HH:mm", "HH:mm:ss" (24h, lo que entrega <input type="time">) y, por si algún dato
// llega con AM/PM (ej. capturado a mano en otro lado), también "h:mm am/pm".
function toMinutes(raw: string): number {
  if (!raw) return 0;
  const value = raw.trim();

  const ampmMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (ampmMatch) {
    let h = Number(ampmMatch[1]) % 12;
    const m = Number(ampmMatch[2]);
    if (/^p/i.test(ampmMatch[3])) h += 12;
    return h * 60 + m;
  }

  const [h, m] = value.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toDateOnly(value: string | Date): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent, UIInputComponent, UISearchComponent, CustomerForm],
  templateUrl: './appointment-form.html',
})
export class AppointmentForm implements OnInit {

  isEdit = input(false);
  appointmentuuid = input<string>('');
  appointment = input<AppointmentResponseInterface | null>(null);

  saved = output<AppointmentResponseInterface>();
  closed = output();

  responseAppointment = signal<AppointmentResponseInterface | null>(null);
  error = signal('');
  sent = signal(false);
  loading = signal(false);
  blocked = signal(false);

  customerMode = signal<CustomerMode>('existing');
  showCustomerForm = signal(false);

  // Acordeón: solo una sección abierta a la vez, en vez de un formulario largo con scroll.
  openSection = signal<'client' | 'schedule' | 'services' | 'details' | ''>('client');

  branches = signal<DropdownOption[]>([]);
  customers = signal<DropdownOption[]>([]);
  users = signal<DropdownOption[]>([]);

  services = signal<ServiceInterface[]>([]);
  servicesCopy = signal<ServiceInterface[]>([]);
  loadingServices = signal(false);

  pendingDetails = signal<PendingDetail[]>([]);

  availability = signal<AvailabilityState>({ status: 'incomplete' });
  private scheduleUuid = signal<string | null>(null);
  private cachedSchedules = signal<ResponseSchedule[]>([]);
  private cachedLicenses = signal<ResponseLicense[]>([]);

  citiesOptions: DropdownOption[] = CITIES.map(city => ({ abv: city, name: city }));
  modeOptions = MODE_OPTIONS;

  totalDuration = computed(() => {
    if (this.pendingDetails().length > 0) {
      return this.pendingDetails().reduce((sum, d) => sum + (d.appointmentdetailduration || 0), 0);
    }
    return Number(this.form.value.appointmentduration) || 0;
  });

  totalAmount = computed(() => this.pendingDetails().reduce((sum, d) => sum + (d.appointmentdetailamount || 0), 0));

  form: FormGroup = new FormGroup({
    branchuuid: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    customeruuid: new FormControl<string>(''),
    appointmentcustomername: new FormControl<string>(''),
    appointmentcustomerphone: new FormControl<string>(''),
    appointmentcustomeremail: new FormControl<string>(''),
    useruuid: new FormControl<string>(''),
    appointmentdate: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    appointmenthour: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    appointmentduration: new FormControl<number | null>(null),
    appointmentmode: new FormControl<string>('at_branch', { nonNullable: true }),
    appointmentcity: new FormControl<string>(''),
    appointmentaddress: new FormControl<string>(''),
  });

  private appointmentsService = inject(AppointmentsService);
  private branchService = inject(BranchService);
  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private commerceService = inject(CommerceService);
  private scheduleService = inject(ScheduleService);
  private licenseService = inject(LicenseService);

  ngOnInit(): void {
    const appt = this.appointment();
    this.blocked.set(this.isEdit() && !!appt && BLOCKED_STATUSES.includes(appt.appointmentstatus));

    this.loadBranches();
    this.loadCustomers();
    this.loadUsers();
    if (!this.isEdit()) this.loadServices();

    if (this.isEdit() && appt) {
      this.customerMode.set(appt.customer ? 'existing' : 'manual');
      this.form.patchValue({
        branchuuid: appt.branch?.branchuuid ?? '',
        customeruuid: appt.customer?.customeruuid ?? '',
        appointmentcustomername: appt.appointmentcustomername ?? '',
        appointmentcustomerphone: appt.appointmentcustomerphone ?? '',
        appointmentcustomeremail: appt.appointmentcustomeremail ?? '',
        useruuid: appt.user?.useruuid ?? '',
        appointmentdate: appt.appointmentdate,
        appointmenthour: appt.appointmenthour,
        appointmentduration: appt.appointmentduration,
        appointmentmode: appt.appointmentmode,
        appointmentcity: appt.appointmentcity ?? '',
        appointmentaddress: appt.appointmentaddress ?? '',
      });
    } else {
      this.form.patchValue({
        branchuuid: this.commerceService.me()?.user.branch?.branchuuid ?? '',
      });
    }

    combineLatest([
      this.form.get('useruuid')!.valueChanges.pipe(startWith(this.form.value.useruuid)),
      this.form.get('appointmentdate')!.valueChanges.pipe(startWith(this.form.value.appointmentdate)),
      this.form.get('appointmenthour')!.valueChanges.pipe(startWith(this.form.value.appointmenthour)),
      this.form.get('appointmentduration')!.valueChanges.pipe(startWith(this.form.value.appointmentduration)),
    ]).pipe(debounceTime(150)).subscribe(() => this.refreshAvailability());
  }

  refreshAvailability() {
    const useruuid = this.form.value.useruuid;

    if (!useruuid) {
      this.availability.set({ status: 'free' });
      return;
    }

    if (this.scheduleUuid() === useruuid) {
      this.evaluateAvailability();
      return;
    }

    this.availability.set({ status: 'loading' });
    forkJoin({
      // Se usa el mismo endpoint que el módulo de Horarios (getAllSchedulesByUser) en vez de
      // getActiveSchedulesByUser, y se filtra "active" aquí, para evitar cualquier diferencia
      // de comportamiento entre ambos endpoints.
      // El backend responde 404 (NOT_FOUND_SCHEDULES / NOT_FOUND_LICENSES) cuando el usuario no
      // tiene ninguno — eso es "lista vacía", no un error real. Si no se captura, forkJoin corta
      // TODO el chequeo (incluyendo el de horarios, que sí puede haber llegado bien) apenas uno
      // de los dos falla; por eso cada llamada cae a [] en vez de propagar el error.
      schedules: this.scheduleService.getAllSchedulesByUser(useruuid).pipe(catchError(() => of([]))),
      licenses: this.licenseService.findAllByUser(useruuid).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ schedules, licenses }) => {
        this.scheduleUuid.set(useruuid);
        this.cachedSchedules.set(schedules.filter(s => s.schedulestatus === 'active'));
        this.cachedLicenses.set(licenses);
        this.evaluateAvailability();
      },
      error: (error: any) => {
        if (error.error.error !== 'NOT_FOUND_LICENSES') {
          this.availability.set({ status: 'unknown', reason: 'No se pudo verificar la disponibilidad del profesional.' });
        }
      },
    });
  }

  private evaluateAvailability() {
    const useruuid = this.form.value.useruuid;
    if (!useruuid) {
      this.availability.set({ status: 'free' });
      return;
    }

    const date: string = this.form.value.appointmentdate;
    const hour: string = this.form.value.appointmenthour;
    const duration = this.totalDuration();

    if (!date || !hour || !duration) {
      this.availability.set({ status: 'incomplete' });
      return;
    }

    const dayOfWeek = DAY_OF_WEEK_BY_INDEX[new Date(`${date}T00:00:00`).getDay()];
    const daySchedules = this.cachedSchedules().filter(s => (s.scheduledayofweek ?? '').trim().toLowerCase() === dayOfWeek.toLowerCase());

    if (daySchedules.length === 0) {
      const reason = this.cachedSchedules().length === 0
        ? 'No tiene ningún horario activo registrado. Revisa el módulo de Horarios de este usuario.'
        : `No tiene un horario activo los ${DAY_LABELS[dayOfWeek]}.`;
      this.availability.set({ status: 'unavailable', reason });
      return;
    }

    const startMinutes = toMinutes(hour);
    const endMinutes = startMinutes + duration;
    const fitsSchedule = daySchedules.some(s => startMinutes >= toMinutes(s.schedulestarttime) && endMinutes <= toMinutes(s.scheduleendtime));

    if (!fitsSchedule) {
      const ranges = daySchedules.map(s => `${s.schedulestarttime} - ${s.scheduleendtime}`).join(', ');
      this.availability.set({ status: 'unavailable', reason: `Fuera de su horario laboral (${ranges}).` });
      return;
    }

    const onLicense = this.cachedLicenses().some(l => l.licensestatus === 'approved' && this.licenseCoversRange(l, date, startMinutes, endMinutes));
    if (onLicense) {
      this.availability.set({ status: 'unavailable', reason: 'Tiene una licencia aprobada que cubre esta fecha y horario.' });
      return;
    }

    this.availability.set({ status: 'available' });
  }

  private licenseCoversRange(license: ResponseLicense, date: string, startMinutes: number, endMinutes: number): boolean {
    if (license.licenseperiod === 'day') {
      return license.licensedate === date;
    }
    if (license.licenseperiod === 'time') {
      if (license.licensedate !== date) return false;
      const lStart = toMinutes(license.licensestarttime ?? '00:00');
      const lEnd = toMinutes(license.licenseendtime ?? '23:59');
      return startMinutes < lEnd && endMinutes > lStart;
    }
    if (license.licenseperiod === 'period') {
      if (!license.licensestartdate || !license.licenseenddate) return false;
      const start = toDateOnly(license.licensestartdate);
      const end = toDateOnly(license.licenseenddate);
      return date >= start && date <= end;
    }
    return false;
  }

  private loadBranches() {
    this.branchService.getBranches().subscribe({
      next: (res) => this.branches.set(res.map(b => ({ abv: b.branchuuid, name: b.branchname }))),
      error: () => { },
    });
  }

  private loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (res) => this.customers.set(res.map(c => ({ abv: c.customeruuid, name: `${c.customerfirstname} ${c.customerlastname}` }))),
      error: () => { },
    });
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => this.users.set(res.map(u => ({ abv: u.useruuid, name: `${u.userfirstname} ${u.userlastname}` }))),
      error: () => { },
    });
  }

  private loadServices() {
    this.loadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        const active = res.filter(s => s.servicestatus === 'active');
        this.services.set(active);
        this.servicesCopy.set(active);
        this.loadingServices.set(false);
      },
      error: () => { this.loadingServices.set(false); },
    });
  }

  onCatalogSearch(value: string) {
    const q = value.toLocaleLowerCase();
    this.servicesCopy.set(this.services().filter(s => s.servicename.toLocaleLowerCase().includes(q)));
  }

  toggleSection(name: 'client' | 'schedule' | 'services' | 'details') {
    this.openSection.update(current => (current === name ? '' : name));
  }

  private optionName(options: DropdownOption[], abv: string): string {
    return options.find(o => o.abv === abv)?.name ?? '';
  }

  get s1Complete(): boolean {
    if (!this.form.value.branchuuid) return false;
    if (this.customerMode() === 'manual') {
      return !!this.form.value.appointmentcustomername && !!this.form.value.appointmentcustomerphone;
    }
    return true;
  }

  get s1Summary(): string {
    const branch = this.optionName(this.branches(), this.form.value.branchuuid);
    const customer = this.customerMode() === 'manual'
      ? this.form.value.appointmentcustomername
      : this.optionName(this.customers(), this.form.value.customeruuid);
    return [branch, customer].filter(Boolean).join(' · ') || 'Selecciona sucursal y cliente';
  }

  get s2Complete(): boolean {
    return !!this.form.value.appointmentdate && !!this.form.value.appointmenthour;
  }

  get s2Summary(): string {
    const { appointmentdate, appointmenthour } = this.form.value;
    const professional = this.optionName(this.users(), this.form.value.useruuid);
    const when = appointmentdate && appointmenthour ? `${appointmentdate} · ${appointmenthour}` : '';
    return [when, professional].filter(Boolean).join(' · ') || 'Selecciona fecha y hora';
  }

  get s3Complete(): boolean {
    if (this.isEdit()) return !!this.form.value.appointmentduration;
    return this.pendingDetails().length > 0 || !!this.form.value.appointmentduration;
  }

  get s3Summary(): string {
    if (this.isEdit()) {
      const count = this.appointment()?.details?.length ?? 0;
      return count > 0 ? `${count} servicio${count === 1 ? '' : 's'} · ${this.form.value.appointmentduration} min` : `${this.form.value.appointmentduration ?? 0} min`;
    }
    if (this.pendingDetails().length > 0) {
      return `${this.pendingDetails().length} servicio${this.pendingDetails().length === 1 ? '' : 's'} · ${this.totalDuration()} min`;
    }
    if (this.form.value.appointmentduration) return `${this.form.value.appointmentduration} min (manual)`;
    return 'Sin servicios seleccionados';
  }

  get s4Complete(): boolean {
    if (this.form.value.appointmentmode !== 'delivered') return true;
    return !!this.form.value.appointmentcity && !!this.form.value.appointmentaddress;
  }

  get s4Summary(): string {
    if (this.form.value.appointmentmode === 'delivered') {
      return this.form.value.appointmentcity ? `A domicilio · ${this.form.value.appointmentcity}` : 'A domicilio';
    }
    return 'En sucursal';
  }

  setCustomerMode(mode: CustomerMode) {
    this.customerMode.set(mode);
    if (mode === 'existing') {
      this.form.patchValue({ appointmentcustomername: '', appointmentcustomerphone: '', appointmentcustomeremail: '' });
    } else {
      this.form.patchValue({ customeruuid: '' });
    }
  }

  openCreateCustomer() {
    this.showCustomerForm.set(true);
  }

  onCustomerCreated(customer: CustomersInterface) {
    this.customers.update(cs => [{ abv: customer.customeruuid, name: `${customer.customerfirstname} ${customer.customerlastname}` }, ...cs]);
    this.form.get('customeruuid')?.setValue(customer.customeruuid);
    this.showCustomerForm.set(false);
  }

  onCustomerFormClosed() {
    this.showCustomerForm.set(false);
  }

  isServiceAdded(service: ServiceInterface): boolean {
    return this.pendingDetails().some(d => d.serviceuuid === service.serviceuuid);
  }

  addServiceDetail(service: ServiceInterface) {
    if (this.isServiceAdded(service)) return;
    this.pendingDetails.update(ds => [...ds, {
      serviceuuid: service.serviceuuid,
      servicename: service.servicename,
      appointmentdetailamount: service.serviceprice,
      appointmentdetailduration: service.serviceduration,
    }]);
    this.evaluateAvailability();
  }

  removeServiceDetail(serviceuuid: string) {
    this.pendingDetails.update(ds => ds.filter(d => d.serviceuuid !== serviceuuid));
    this.evaluateAvailability();
  }

  get branchError(): string {
    if (!this.sent()) return '';
    if (this.form.get('branchuuid')?.errors?.['required']) return 'Selecciona una sucursal';
    return '';
  }

  get dateError(): string {
    if (!this.sent()) return '';
    if (this.form.get('appointmentdate')?.errors?.['required']) return 'La fecha es requerida';
    return '';
  }

  get hourError(): string {
    if (!this.sent()) return '';
    if (this.form.get('appointmenthour')?.errors?.['required']) return 'La hora es requerida';
    return '';
  }

  get customerNameError(): string {
    if (!this.sent()) return '';
    if (this.customerMode() === 'manual' && !this.form.value.appointmentcustomername) return 'El nombre del cliente es requerido';
    return '';
  }

  get customerPhoneError(): string {
    if (!this.sent()) return '';
    if (this.customerMode() === 'manual' && !this.form.value.appointmentcustomerphone) return 'El teléfono del cliente es requerido';
    return '';
  }

  get durationError(): string {
    if (!this.sent()) return '';
    if (!this.isEdit() && this.pendingDetails().length === 0 && !this.form.value.appointmentduration) {
      return 'Selecciona al menos un servicio o indica la duración manualmente';
    }
    if (this.isEdit() && !this.form.value.appointmentduration) return 'La duración es requerida';
    return '';
  }

  get cityError(): string {
    if (!this.sent()) return '';
    if (this.form.value.appointmentmode === 'delivered' && !this.form.value.appointmentcity) return 'La ciudad es requerida';
    return '';
  }

  get addressError(): string {
    if (!this.sent()) return '';
    if (this.form.value.appointmentmode === 'delivered' && !this.form.value.appointmentaddress) return 'La dirección es requerida';
    return '';
  }

  close() {
    this.closed.emit();
  }

  private hasBlockingErrors(): boolean {
    return !!(this.branchError || this.dateError || this.hourError || this.customerNameError
      || this.customerPhoneError || this.durationError || this.cityError || this.addressError);
  }

  submit() {
    this.sent.set(true);

    // Con los campos agrupados en acordeón, un error puede quedar en una sección colapsada:
    // se abre la primera que tenga un error para que el usuario la vea sin tener que buscarla.
    if (this.branchError || this.customerNameError || this.customerPhoneError) this.openSection.set('client');
    else if (this.dateError || this.hourError) this.openSection.set('schedule');
    else if (this.durationError) this.openSection.set('services');
    else if (this.cityError || this.addressError) this.openSection.set('details');

    if (this.form.get('branchuuid')?.invalid || this.form.get('appointmentdate')?.invalid || this.form.get('appointmenthour')?.invalid) return;
    if (this.hasBlockingErrors()) return;

    this.loading.set(true);
    this.error.set('');

    const v = this.form.value;
    const isManual = this.customerMode() === 'manual';
    const isDelivered = v.appointmentmode === 'delivered';

    const base = {
      branchuuid: v.branchuuid,
      customeruuid: isManual ? undefined : (v.customeruuid || undefined),
      appointmentcustomername: isManual ? v.appointmentcustomername : undefined,
      appointmentcustomerphone: isManual ? v.appointmentcustomerphone : undefined,
      appointmentcustomeremail: isManual ? (v.appointmentcustomeremail || undefined) : undefined,
      useruuid: v.useruuid || undefined,
      appointmentdate: v.appointmentdate,
      appointmenthour: v.appointmenthour,
      appointmentmode: v.appointmentmode as 'at_branch' | 'delivered',
      appointmentcity: isDelivered ? v.appointmentcity : undefined,
      appointmentaddress: isDelivered ? v.appointmentaddress : undefined,
    };

    if (this.isEdit() && this.appointmentuuid()) {
      const payload: UpdateAppointmentInterface = { ...base, appointmentduration: v.appointmentduration ?? undefined };
      this.appointmentsService.update(this.appointmentuuid(), payload).subscribe({
        next: (response) => {
          this.responseAppointment.set(response);
          this.loading.set(false);
          this.saved.emit(response);
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.error.set(body?.message || 'No se pudo actualizar la cita. Inténtalo nuevamente.');
          this.loading.set(false);
        },
      });
    } else {
      const payload: CreateAppointmentInterface = {
        ...base,
        ...(this.pendingDetails().length > 0
          ? { details: this.pendingDetails().map(d => ({ serviceuuid: d.serviceuuid, appointmentdetailamount: d.appointmentdetailamount, appointmentdetailduration: d.appointmentdetailduration })) }
          : { appointmentduration: v.appointmentduration ?? undefined }),
      };
      this.appointmentsService.create(payload).subscribe({
        next: (response) => {
          this.responseAppointment.set(response);
          this.loading.set(false);
          this.saved.emit(response);
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.error.set(body?.message || 'No se pudo crear la cita. Inténtalo nuevamente.');
          this.loading.set(false);
        },
      });
    }
  }

}
