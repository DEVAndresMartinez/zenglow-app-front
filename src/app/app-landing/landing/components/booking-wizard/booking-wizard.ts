import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, output, signal, computed } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../../../core/services/landing-commerces.service';
import {
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
  PublicBranchDto,
  PublicCustomerDocumentType,
  PublicCustomerMatchDto,
  PublicProfessionalDto,
  ServiceLandingDto,
} from '../../../core/interfaces/landing.interface';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';
import { DropdownOption, UIDropdownComponent } from '../../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';

const DOCUMENT_TYPE_OPTIONS: DropdownOption[] = [
  { abv: 'CC', name: 'Cédula de ciudadanía' },
  { abv: 'CE', name: 'Cédula de extranjería' },
  { abv: 'NIT', name: 'NIT' },
  { abv: 'RUC', name: 'RUC' },
];

type SectionKey = 'branch' | 'professional' | 'services' | 'schedule' | 'contact';
@Component({
  selector: 'landing-booking-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIDropdownComponent],
  templateUrl: './booking-wizard.html',
})
export class BookingWizardComponent {

  private landingCommercesService = inject(LandingCommercesService);

  visible = input<boolean>(false);
  commerceuuid = input.required<string>();
  commerceSlug = input.required<string>();
  branches = input<PublicBranchDto[]>([]);
  professionals = input<PublicProfessionalDto[]>([]);
  services = input<ServiceLandingDto[]>([]);

  /** Preselección al abrir el wizard desde un CTA de "Reservar" de un servicio/profesional puntual. */
  preselectedServiceUuid = input<string | null>(null);
  preselectedProfessionalUuid = input<string | null>(null);

  closeRequested = output<void>();
  booked = output<CreatePublicAppointmentResponseDto>();

  readonly minDate = new Date().toISOString().slice(0, 10);

  openSection = signal<SectionKey | ''>('branch');
  sent = signal(false);

  selectedBranch = signal<PublicBranchDto | null>(null);
  selectedProfessional = signal<PublicProfessionalDto | null>(null);
  selectedServiceUuids = signal<Set<string>>(new Set());
  appointmentDate = signal<string>('');
  appointmentHour = signal<string>('');

  availableSlots = signal<string[]>([]);
  availabilityLoading = signal<boolean>(false);
  availabilityError = signal<string | null>(null);

  submitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);
  confirmation = signal<CreatePublicAppointmentResponseDto | null>(null);
  copied = signal<boolean>(false);

  // Correo obligatorio: es la única vía para enviarle al invitado el enlace de confirmación de
  // su cita. "Nombre"/"Apellido" van separados (y no un solo campo "Nombre completo") porque así
  // los necesita también el registro opcional como cliente del comercio (customerfirstname/
  // customerlastname), evitando tener que volver a pedirlos o partir el nombre a adivinar.
  contactForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  registerAsCustomer = signal(false);
  documentTypeOptions = DOCUMENT_TYPE_OPTIONS;

  registerCustomerForm = new FormGroup({
    documenttype: new FormControl<PublicCustomerDocumentType>('CC', { nonNullable: true }),
    documentnumber: new FormControl('', { nonNullable: true }),
  });

  toggleRegisterAsCustomer(checked: boolean): void {
    this.registerAsCustomer.set(checked);
    const documentnumberCtrl = this.registerCustomerForm.get('documentnumber');
    if (checked) {
      documentnumberCtrl?.addValidators(Validators.required);
    } else {
      documentnumberCtrl?.clearValidators();
    }
    documentnumberCtrl?.updateValueAndValidity();
  }

  // --- "Ya soy cliente registrado": búsqueda por documento exacto contra .../customers/search
  // (respuesta enmascarada por el backend), con confirmación explícita antes de darla por buena. ---

  contactMode = signal<'guest' | 'lookup'>('guest');

  customerSearchForm = new FormGroup({
    documenttype: new FormControl<PublicCustomerDocumentType>('CC', { nonNullable: true }),
    documentnumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  customerSearchLoading = signal(false);
  customerSearchAttempted = signal(false);
  customerSearchError = signal<string | null>(null);
  /** Resultado crudo de la búsqueda, pendiente de que el usuario confirme "sí, soy yo". */
  foundCustomerMatch = signal<PublicCustomerMatchDto | null>(null);
  /** Cliente confirmado: es lo único que realmente se usa para completar la reserva. */
  existingCustomer = signal<PublicCustomerMatchDto | null>(null);

  setContactMode(mode: 'guest' | 'lookup'): void {
    this.contactMode.set(mode);
    if (mode === 'guest') this.clearFoundCustomer();
  }

  searchCustomer(): void {
    if (this.customerSearchForm.invalid || this.customerSearchLoading()) return;

    const { documenttype, documentnumber } = this.customerSearchForm.getRawValue();
    this.customerSearchLoading.set(true);
    this.customerSearchError.set(null);
    this.foundCustomerMatch.set(null);
    this.existingCustomer.set(null);

    this.landingCommercesService.searchCustomerByDocument(this.commerceuuid(), documenttype, documentnumber.trim()).subscribe({
      next: (match) => {
        this.foundCustomerMatch.set(match);
        this.customerSearchLoading.set(false);
        this.customerSearchAttempted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.customerSearchLoading.set(false);
        this.customerSearchAttempted.set(true);
        this.customerSearchError.set(err.status === 404
          ? 'No encontramos ningún cliente con ese documento en este comercio.'
          : (err.error?.message ?? 'No se pudo buscar el cliente. Intenta nuevamente.'));
      },
    });
  }

  confirmFoundCustomer(): void {
    this.existingCustomer.set(this.foundCustomerMatch());
  }

  clearFoundCustomer(): void {
    this.foundCustomerMatch.set(null);
    this.existingCustomer.set(null);
    this.customerSearchAttempted.set(false);
    this.customerSearchError.set(null);
    this.customerSearchForm.reset({ documenttype: 'CC', documentnumber: '' });
  }

  // Filtro estricto: solo se muestran los servicios que ese profesional tiene explícitamente
  // vinculados (user_services). Si el comercio aún no configuró esa relación para un profesional,
  // la sección queda vacía en vez de mostrar todo el catálogo — así el dato siempre refleja la
  // realidad de a quién se le puede reservar cada servicio.
  servicesForSelectedProfessional = computed(() => {
    const professional = this.selectedProfessional();
    if (!professional) return [];
    return this.services().filter(s => professional.serviceuuids.includes(s.serviceuuid));
  });

  // Solo los profesionales asignados a la sucursal elegida.
  professionalsForSelectedBranch = computed(() => {
    const branch = this.selectedBranch();
    if (!branch) return [];
    return this.professionals().filter(p => p.branchuuid === branch.branchuuid);
  });

  selectedServices = computed(() => this.services().filter(s => this.selectedServiceUuids().has(s.serviceuuid)));
  totalDuration = computed(() => this.selectedServices().reduce((sum, s) => sum + (s.serviceduration ?? 0), 0));
  totalPrice = computed(() => this.selectedServices().reduce((sum, s) => sum + (s.serviceprice ?? 0), 0));

  confirmationLink = computed(() => {
    const result = this.confirmation();
    if (!result) return '';
    return `${window.location.origin}/landing-page/${this.commerceSlug()}/citas/${result.appointmentconfirmationtoken}`;
  });

  constructor() {
    // Cada vez que se abre el modal se arranca desde cero (con las preselecciones que traiga).
    effect(() => {
      if (this.visible()) this.resetState();
    });

    // La disponibilidad real solo se conoce en el backend, nunca se calcula en el cliente: se
    // vuelve a consultar cada vez que cambia el profesional, la fecha o la duración total de los
    // servicios elegidos (fetchAvailability no llama a la API hasta que los tres estén listos).
    effect(() => {
      this.selectedProfessional();
      this.appointmentDate();
      this.totalDuration();
      this.fetchAvailability();
    });
  }

  toggleSection(name: SectionKey): void {
    this.openSection.update(current => (current === name ? '' : name));
  }

  selectBranch(branch: PublicBranchDto): void {
    this.selectedBranch.set(branch);
    // Si el profesional ya elegido no trabaja en la nueva sucursal, se descarta (y con él, los
    // servicios ya seleccionados, vía la misma lógica que selectProfessional).
    const currentProfessional = this.selectedProfessional();
    if (currentProfessional && currentProfessional.branchuuid !== branch.branchuuid) {
      this.selectProfessional(null);
    }
    if (this.openSection() === 'branch') this.openSection.set('professional');
  }

  selectProfessional(professional: PublicProfessionalDto | null): void {
    this.selectedProfessional.set(professional);
    // Si algún servicio seleccionado ya no lo ofrece este profesional, se descarta.
    const offered = new Set(this.servicesForSelectedProfessional().map(s => s.serviceuuid));
    this.selectedServiceUuids.update(current => new Set([...current].filter(uuid => offered.has(uuid))));
    if (professional && this.openSection() === 'professional') this.openSection.set('services');
  }

  toggleService(serviceuuid: string): void {
    this.selectedServiceUuids.update(current => {
      const next = new Set(current);
      if (next.has(serviceuuid)) next.delete(serviceuuid); else next.add(serviceuuid);
      return next;
    });
  }

  selectSlot(slot: string): void {
    this.appointmentHour.set(slot);
  }

  onDateChange(value: string): void {
    this.appointmentDate.set(value);
    this.appointmentHour.set('');
  }

  // --- Estado por sección: resumen (línea visible cuando está colapsada) + si ya está completa
  // (círculo con check verde en el encabezado), igual que en el modal admin de citas. ---

  get branchComplete(): boolean {
    return !!this.selectedBranch();
  }

  get branchSummary(): string {
    return this.selectedBranch()?.branchname ?? 'Selecciona una sucursal';
  }

  get professionalComplete(): boolean {
    return !!this.selectedProfessional();
  }

  get professionalSummary(): string {
    const p = this.selectedProfessional();
    return p ? `${p.userfirstname} ${p.userlastname}` : 'Selecciona un profesional';
  }

  get servicesComplete(): boolean {
    return this.selectedServices().length > 0;
  }

  get servicesSummary(): string {
    const n = this.selectedServices().length;
    return n > 0 ? `${n} servicio${n === 1 ? '' : 's'} · ${this.totalDuration()} min` : 'Selecciona uno o varios servicios';
  }

  get scheduleComplete(): boolean {
    return !!this.appointmentDate() && !!this.appointmentHour();
  }

  get scheduleSummary(): string {
    return this.appointmentDate() && this.appointmentHour()
      ? `${this.appointmentDate()} · ${this.appointmentHour()}`
      : 'Elige fecha y horario';
  }

  get contactComplete(): boolean {
    if (this.contactMode() === 'lookup') return !!this.existingCustomer();
    if (!this.contactForm.valid) return false;
    if (this.registerAsCustomer() && this.registerCustomerForm.invalid) return false;
    return true;
  }

  get contactSummary(): string {
    const existing = this.existingCustomer();
    if (existing) return `${existing.customerfirstname} ${existing.customerlastname} (cliente registrado)`;
    const v = this.contactForm.value;
    return v.firstname && v.phone ? `${v.firstname} ${v.lastname ?? ''} · ${v.phone}`.trim() : 'Ingresa tus datos de contacto';
  }

  get firstnameError(): string {
    if (!this.sent()) return '';
    if (this.contactForm.get('firstname')?.errors?.['required']) return 'El nombre es requerido';
    return '';
  }

  get lastnameError(): string {
    if (!this.sent()) return '';
    if (this.contactForm.get('lastname')?.errors?.['required']) return 'El apellido es requerido';
    return '';
  }

  get phoneError(): string {
    if (!this.sent()) return '';
    if (this.contactForm.get('phone')?.errors?.['required']) return 'El teléfono es requerido';
    return '';
  }

  get emailError(): string {
    if (!this.sent()) return '';
    if (this.contactForm.get('email')?.errors?.['required']) return 'El correo es requerido para poder confirmarte la cita';
    if (this.contactForm.get('email')?.errors?.['email']) return 'Correo inválido';
    return '';
  }

  get documentNumberError(): string {
    if (!this.sent() || !this.registerAsCustomer()) return '';
    if (this.registerCustomerForm.get('documentnumber')?.errors?.['required']) return 'El número de documento es requerido';
    return '';
  }

  submit(): void {
    if (this.submitting()) return;
    this.sent.set(true);

    // Con las secciones plegables, un dato faltante puede quedar en una sección colapsada: se
    // abre la primera que tenga algo pendiente para que el usuario la vea sin tener que buscarla.
    if (!this.branchComplete) { this.openSection.set('branch'); return; }
    if (!this.professionalComplete) { this.openSection.set('professional'); return; }
    if (!this.servicesComplete) { this.openSection.set('services'); return; }
    if (!this.scheduleComplete) { this.openSection.set('schedule'); return; }
    if (!this.contactComplete) { this.openSection.set('contact'); return; }

    const branch = this.selectedBranch();
    const professional = this.selectedProfessional();
    if (!branch || !professional) return;

    const existing = this.existingCustomer();
    const contact = this.contactForm.getRawValue();
    const dto: CreatePublicAppointmentDto = {
      branchuuid: branch.branchuuid,
      useruuid: professional.useruuid,
      appointmentdate: this.appointmentDate(),
      appointmenthour: this.appointmentHour(),
      appointmentmode: 'at_branch',
      details: this.selectedServices().map(service => ({ serviceuuid: service.serviceuuid })),
      ...(existing ? {
        // Cliente ya registrado y confirmado: el backend toma nombre/teléfono/correo del
        // Customer encontrado, no hace falta (ni se puede, solo tenemos la versión enmascarada)
        // enviarlos aquí.
        customeruuid: existing.customeruuid,
      } : {
        appointmentcustomername: `${contact.firstname} ${contact.lastname}`.trim(),
        appointmentcustomerphone: contact.phone.trim(),
        appointmentcustomeremail: contact.email.trim(),
        ...(this.registerAsCustomer() ? {
          registerascustomer: true,
          customerfirstname: contact.firstname.trim(),
          customerlastname: contact.lastname.trim(),
          customerdocumenttype: this.registerCustomerForm.getRawValue().documenttype,
          customerdocumentnumber: this.registerCustomerForm.getRawValue().documentnumber.trim(),
        } : {}),
      }),
    };

    this.submitting.set(true);
    this.submitError.set(null);

    this.landingCommercesService.createAppointment(this.commerceuuid(), dto).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
        this.confirmation.set(result);
        this.booked.emit(result);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message ?? 'No se pudo agendar la cita. Intenta nuevamente.');
        // El slot pudo dejar de estar disponible entre pasos (condición de carrera resuelta en
        // el backend): se refresca la disponibilidad para no dejar seleccionada una hora inválida.
        this.appointmentHour.set('');
        this.fetchAvailability();
      },
    });
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.confirmationLink());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Sin acceso al portapapeles (permiso denegado / contexto no seguro): el link ya está
      // visible en pantalla para copiarlo manualmente, no es un error bloqueante.
    }
  }

  close(): void {
    this.closeRequested.emit();
  }

  private fetchAvailability(): void {
    const professional = this.selectedProfessional();
    const date = this.appointmentDate();
    const duration = this.totalDuration();

    if (!professional || !date || !duration) {
      this.availableSlots.set([]);
      return;
    }

    this.availabilityLoading.set(true);
    this.availabilityError.set(null);

    this.landingCommercesService.getAvailability(this.commerceuuid(), professional.useruuid, date, duration).subscribe({
      next: (res) => {
        this.availableSlots.set(res.slots);
        this.availabilityLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.availableSlots.set([]);
        this.availabilityLoading.set(false);
        this.availabilityError.set(err.error?.message ?? 'No se pudo cargar la disponibilidad. Intenta nuevamente.');
      },
    });
  }

  private resetState(): void {
    this.openSection.set('branch');
    this.sent.set(false);

    const branches = this.branches();
    this.selectedBranch.set(branches.length === 1 ? branches[0] : null);

    const preselectedProfessional = this.preselectedProfessionalUuid()
      ? this.professionals().find(p => p.useruuid === this.preselectedProfessionalUuid()) ?? null
      : null;
    this.selectedProfessional.set(preselectedProfessional);

    const preselectedServiceUuid = this.preselectedServiceUuid();
    this.selectedServiceUuids.set(preselectedServiceUuid ? new Set([preselectedServiceUuid]) : new Set());

    this.appointmentDate.set('');
    this.appointmentHour.set('');
    this.availableSlots.set([]);
    this.availabilityLoading.set(false);
    this.availabilityError.set(null);
    this.contactForm.reset({ firstname: '', lastname: '', phone: '', email: '' });
    this.registerAsCustomer.set(false);
    this.registerCustomerForm.reset({ documenttype: 'CC', documentnumber: '' });
    this.registerCustomerForm.get('documentnumber')?.clearValidators();
    this.registerCustomerForm.get('documentnumber')?.updateValueAndValidity();
    this.contactMode.set('guest');
    this.customerSearchLoading.set(false);
    this.clearFoundCustomer();
    this.submitting.set(false);
    this.submitError.set(null);
    this.submitSuccess.set(false);
    this.confirmation.set(null);
    this.copied.set(false);
  }
}
