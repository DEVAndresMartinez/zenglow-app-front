import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingCommercesService } from '../../../core/services/landing-commerces.service';
import {
  CreatePublicAppointmentDto,
  CreatePublicAppointmentResponseDto,
  PublicBranchDto,
  PublicProfessionalDto,
  ServiceLandingDto,
} from '../../../core/interfaces/landing.interface';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';

interface WizardStep {
  n: number;
  label: string;
}

const TOTAL_STEPS = 7;

/**
 * Wizard de agendamiento público: sucursal -> profesional -> servicios ->
 * fecha -> hora (disponibilidad real vía backend) -> contacto -> confirmar.
 *
 * Reserva de "invitado" (sin cuenta): solo pide nombre/teléfono/email. La
 * disponibilidad y la validación final del slot las hace siempre el
 * backend (GET .../availability para listar, POST .../appointments para
 * confirmar) — este componente nunca decide por su cuenta si un horario
 * es válido.
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
  commerceSlug = input.required<string>();
  branches = input<PublicBranchDto[]>([]);
  professionals = input<PublicProfessionalDto[]>([]);
  services = input<ServiceLandingDto[]>([]);

  /** Preselección al abrir el wizard desde un CTA de "Reservar" de un servicio/profesional puntual. */
  preselectedServiceUuid = input<string | null>(null);
  preselectedProfessionalUuid = input<string | null>(null);

  closeRequested = output<void>();
  booked = output<CreatePublicAppointmentResponseDto>();

  readonly steps: WizardStep[] = [
    { n: 1, label: 'Sucursal' },
    { n: 2, label: 'Profesional' },
    { n: 3, label: 'Servicios' },
    { n: 4, label: 'Fecha' },
    { n: 5, label: 'Hora' },
    { n: 6, label: 'Contacto' },
    { n: 7, label: 'Confirmar' },
  ];

  readonly minDate = new Date().toISOString().slice(0, 10);

  step = signal<number>(1);

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

  contactForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
  });

  // Si el profesional no tiene servicios explícitamente vinculados (aún no configurado por el
  // comercio), se asume que ofrece todo el catálogo en vez de dejar el paso vacío.
  servicesForSelectedProfessional = computed(() => {
    const professional = this.selectedProfessional();
    const all = this.services();
    if (!professional || !professional.serviceuuids.length) return all;
    return all.filter(s => professional.serviceuuids.includes(s.serviceuuid));
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

    // La disponibilidad real solo se conoce en el backend: se consulta al entrar al paso de
    // hora, nunca se calcula en el cliente.
    effect(() => {
      if (this.step() === 5) this.fetchAvailability();
    });
  }

  selectBranch(branch: PublicBranchDto): void {
    this.selectedBranch.set(branch);
  }

  selectProfessional(professional: PublicProfessionalDto): void {
    this.selectedProfessional.set(professional);
    // Si algún servicio seleccionado ya no lo ofrece este profesional, se descarta.
    const offered = new Set(this.servicesForSelectedProfessional().map(s => s.serviceuuid));
    this.selectedServiceUuids.update(current => new Set([...current].filter(uuid => offered.has(uuid))));
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

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.selectedBranch();
      case 2: return !!this.selectedProfessional();
      case 3: return this.selectedServices().length > 0;
      case 4: return !!this.appointmentDate();
      case 5: return !!this.appointmentHour();
      case 6: return this.contactForm.valid;
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

  submit(): void {
    if (this.submitting()) return;

    const branch = this.selectedBranch();
    const professional = this.selectedProfessional();
    if (!branch || !professional) return;

    const contact = this.contactForm.getRawValue();
    const dto: CreatePublicAppointmentDto = {
      branchuuid: branch.branchuuid,
      useruuid: professional.useruuid,
      appointmentcustomername: contact.name.trim(),
      appointmentcustomerphone: contact.phone.trim(),
      ...(contact.email?.trim() ? { appointmentcustomeremail: contact.email.trim() } : {}),
      appointmentdate: this.appointmentDate(),
      appointmenthour: this.appointmentHour(),
      appointmentmode: 'at_branch',
      details: this.selectedServices().map(service => ({ serviceuuid: service.serviceuuid })),
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
    this.step.set(1);

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
    this.contactForm.reset({ name: '', phone: '', email: '' });
    this.submitting.set(false);
    this.submitError.set(null);
    this.submitSuccess.set(false);
    this.confirmation.set(null);
    this.copied.set(false);
  }
}
