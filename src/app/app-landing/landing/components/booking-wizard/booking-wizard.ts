import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../../../core/services/landing-commerces.service';
import {
  BranchLandingDto,
  CreateAppointmentDetailDto,
  CreateAppointmentDto,
  CreateLandingCustomerDto,
  LandingCustomerDto,
  LandingDocumentType,
  ServiceLandingDto,
  UserLandingDto,
} from '../../../core/interfaces/landing.interface';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';

interface WizardStep {
  n: number;
  label: string;
}

const TOTAL_STEPS = 6;

/**
 * Wizard de agendamiento público: sucursal -> profesional -> servicios ->
 * fecha/hora -> contacto (buscar cliente o registrarse) -> confirmación.
 *
 * La búsqueda/creación de cliente y la creación de la cita apuntan a rutas
 * provisionales en LandingCommercesService (ver TODOs allí) mientras esos
 * endpoints públicos no existan.
 */
@Component({
  selector: 'landing-booking-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent],
  templateUrl: './booking-wizard.html',
})
export class BookingWizardComponent {

  private landingCommercesService = inject(LandingCommercesService);

  visible = input<boolean>(false);
  commerceuuid = input.required<string>();
  branches = input<BranchLandingDto[]>([]);
  professionals = input<UserLandingDto[]>([]);
  services = input<ServiceLandingDto[]>([]);

  closeRequested = output<void>();
  booked = output<void>();

  readonly steps: WizardStep[] = [
    { n: 1, label: 'Sucursal' },
    { n: 2, label: 'Profesional' },
    { n: 3, label: 'Servicios' },
    { n: 4, label: 'Fecha y hora' },
    { n: 5, label: 'Contacto' },
    { n: 6, label: 'Confirmar' },
  ];

  readonly minDate = new Date().toISOString().slice(0, 10);

  step = signal<number>(1);

  selectedBranch = signal<BranchLandingDto | null>(null);
  selectedProfessional = signal<UserLandingDto | null>(null);
  selectedServiceUuids = signal<Set<string>>(new Set());
  appointmentDate = signal<string>('');
  appointmentHour = signal<string>('');

  customerSearchQuery = signal<string>('');
  customerSearchLoading = signal<boolean>(false);
  foundCustomer = signal<LandingCustomerDto | null>(null);
  searchAttempted = signal<boolean>(false);
  wantsToRegister = signal<boolean>(false);

  submitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);

  guestForm = new FormGroup({
    customerfirstname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    customerlastname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    customerphone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    customeremail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    customerdocumenttype: new FormControl<LandingDocumentType>('CC', { nonNullable: true }),
    customerdocumentnumber: new FormControl('', { nonNullable: true }),
  });

  // Filtra staff explícitamente inactivo; si el status no es reconocible, se
  // prefiere mostrar a todos antes que dejar el paso vacío por un valor inesperado.
  activeProfessionals = computed(() => {
    const all = this.professionals();
    const active = all.filter(u => !['inactive', 'inactivo'].includes((u.userstatus ?? '').toLowerCase()));
    return active.length ? active : all;
  });

  selectedServices = computed(() => this.services().filter(s => this.selectedServiceUuids().has(s.serviceuuid)));
  totalDuration = computed(() => this.selectedServices().reduce((sum, s) => sum + (s.serviceduration ?? 0), 0));
  totalPrice = computed(() => this.selectedServices().reduce((sum, s) => sum + (s.serviceprice ?? 0), 0));

  constructor() {
    // Cada vez que se abre el modal se arranca desde cero.
    effect(() => {
      if (this.visible()) {
        this.resetState();
      }
    });
  }

  selectBranch(branch: BranchLandingDto): void {
    this.selectedBranch.set(branch);
  }

  selectProfessional(professional: UserLandingDto): void {
    this.selectedProfessional.set(professional);
  }

  toggleService(serviceuuid: string): void {
    this.selectedServiceUuids.update(current => {
      const next = new Set(current);
      if (next.has(serviceuuid)) next.delete(serviceuuid); else next.add(serviceuuid);
      return next;
    });
  }

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.selectedBranch();
      case 2: return !!this.selectedProfessional();
      case 3: return this.selectedServices().length > 0;
      case 4: return !!this.appointmentDate() && !!this.appointmentHour();
      case 5: return this.isContactValid();
      default: return true;
    }
  }

  goNext(): void {
    if (!this.canProceed() || this.step() >= TOTAL_STEPS) return;
    this.step.update(s => s + 1);
  }

  goPrev(): void {
    if (this.step() <= 1) return;
    this.step.update(s => s - 1);
  }

  runSearch(): void {
    const query = this.customerSearchQuery().trim();
    if (!query) return;

    this.customerSearchLoading.set(true);

    this.landingCommercesService.searchCustomer(this.commerceuuid(), query).subscribe({
      next: (customer) => {
        this.foundCustomer.set(customer ?? null);
        this.searchAttempted.set(true);
        this.customerSearchLoading.set(false);
      },
      error: () => {
        // Sin coincidencia (o endpoint aún no disponible): se deja continuar como invitado.
        this.foundCustomer.set(null);
        this.searchAttempted.set(true);
        this.customerSearchLoading.set(false);
      },
    });
  }

  changeCustomer(): void {
    this.foundCustomer.set(null);
    this.searchAttempted.set(false);
    this.customerSearchQuery.set('');
  }

  contactName(): string {
    const found = this.foundCustomer();
    if (found) return `${found.customerfirstname} ${found.customerlastname}`.trim();
    const { customerfirstname, customerlastname } = this.guestForm.value;
    return `${customerfirstname ?? ''} ${customerlastname ?? ''}`.trim();
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitError.set(null);

    const found = this.foundCustomer();
    if (found) {
      this.createAppointment(found.customeruuid, {
        firstname: found.customerfirstname,
        lastname: found.customerlastname,
        phone: found.customerphone,
        email: found.customeremail,
      });
      return;
    }

    const guest = this.guestForm.getRawValue();
    const contact = {
      firstname: guest.customerfirstname,
      lastname: guest.customerlastname,
      phone: guest.customerphone,
      email: guest.customeremail,
    };

    if (!this.wantsToRegister()) {
      this.createAppointment(undefined, contact);
      return;
    }

    this.submitting.set(true);
    const createDto: CreateLandingCustomerDto = {
      customerdocumenttype: guest.customerdocumenttype,
      customerdocumentnumber: guest.customerdocumentnumber,
      customerfirstname: contact.firstname,
      customerlastname: contact.lastname,
      customerphone: contact.phone,
      customeremail: contact.email,
    };

    this.landingCommercesService.createCustomer(this.commerceuuid(), createDto).subscribe({
      next: (customer) => {
        this.submitting.set(false);
        this.createAppointment(customer.customeruuid, contact);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message ?? 'No se pudo registrar tus datos como cliente. Intenta nuevamente.');
      },
    });
  }

  close(): void {
    this.closeRequested.emit();
  }

  private isContactValid(): boolean {
    if (this.foundCustomer()) return true;
    if (!this.searchAttempted()) return false;
    if (this.guestForm.invalid) return false;
    if (this.wantsToRegister() && !this.guestForm.value.customerdocumentnumber) return false;
    return true;
  }

  private createAppointment(
    customeruuid: string | undefined,
    contact: { firstname: string; lastname: string; phone: string; email: string },
  ): void {
    const branch = this.selectedBranch();
    const professional = this.selectedProfessional();
    if (!branch || !professional) return;

    const details: CreateAppointmentDetailDto[] = this.selectedServices().map(service => ({
      serviceuuid: service.serviceuuid,
      appointmentdetailamount: service.serviceprice,
      appointmentdetailduration: service.serviceduration,
    }));

    const dto: CreateAppointmentDto = {
      branchuuid: branch.branchuuid,
      useruuid: professional.useruuid,
      appointmentcustomername: `${contact.firstname} ${contact.lastname}`.trim(),
      appointmentcustomerphone: contact.phone,
      appointmentcustomeremail: contact.email,
      appointmentdate: this.appointmentDate(),
      appointmenthour: this.appointmentHour(),
      appointmentduration: this.totalDuration(),
      appointmentstatus: 'pending',
      appointmentmode: 'at_branch',
      appointmentcity: branch.branchcity,
      appointmentaddress: branch.branchaddress,
      details,
    };
    if (customeruuid) dto.customeruuid = customeruuid;

    this.submitting.set(true);
    this.landingCommercesService.createAppointment(this.commerceuuid(), dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
        setTimeout(() => {
          this.booked.emit();
          this.close();
        }, 1800);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message ?? 'No se pudo agendar la cita. Intenta nuevamente.');
      },
    });
  }

  private resetState(): void {
    this.step.set(1);
    this.selectedBranch.set(null);
    this.selectedProfessional.set(null);
    this.selectedServiceUuids.set(new Set());
    this.appointmentDate.set('');
    this.appointmentHour.set('');
    this.customerSearchQuery.set('');
    this.customerSearchLoading.set(false);
    this.foundCustomer.set(null);
    this.searchAttempted.set(false);
    this.wantsToRegister.set(false);
    this.guestForm.reset({ customerdocumenttype: 'CC', customerfirstname: '', customerlastname: '', customerphone: '', customeremail: '', customerdocumentnumber: '' });
    this.submitting.set(false);
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }
}
