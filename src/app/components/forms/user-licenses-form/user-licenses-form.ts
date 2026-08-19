import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { ActionMenuItem, UIActionMenuComponent } from '../../shared/ui/ui-action-menu/ui-action-menu';
import { UIConfirmModalComponent } from '../../shared/ui/ui-confirm-modal/ui-confirm-modal';
import { LicenseService } from '../../../core/services/modules/license.service';
import { CreateLicenseInterface, ResponseLicense, UpdateLicenseInterface } from '../../../core/interfaces/license.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

type LicenseView = 'list' | 'form';

const LICENSE_TYPE_OPTIONS: DropdownOption[] = [
  { abv: 'medico', name: 'Médica' },
  { abv: 'birthday', name: 'Cumpleaños' },
  { abv: 'family', name: 'Familiar' },
  { abv: 'personal', name: 'Personal' },
  { abv: 'other', name: 'Otro' },
];

const LICENSE_PERIOD_OPTIONS: DropdownOption[] = [
  { abv: 'time', name: 'Por horas' },
  { abv: 'day', name: 'Día completo' },
  { abv: 'period', name: 'Rango de días' },
];

const LICENSE_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  medico: { label: 'Médica', icon: 'notes-medical' },
  birthday: { label: 'Cumpleaños', icon: 'cake-candles' },
  family: { label: 'Familiar', icon: 'people-roof' },
  personal: { label: 'Personal', icon: 'user' },
  other: { label: 'Otro', icon: 'ellipsis' },
};

const LICENSE_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  requested: { label: 'Pendiente', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  approved: { label: 'Aprobada', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  rechazado: { label: 'Rechazada', classes: 'bg-error/10 text-error border-error/30' },
  expired: { label: 'Expirada', classes: 'bg-stroke/40 text-muted border-stroke' },
};

@Component({
  selector: 'app-user-licenses-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent, UIInputComponent, UIActionMenuComponent, UIConfirmModalComponent],
  templateUrl: './user-licenses-form.html',
})
export class UserLicensesForm implements OnInit {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  closed = output();

  view = signal<LicenseView>('list');

  licenses = signal<ResponseLicense[]>([]);
  loadingList = signal(false);
  listError = signal('');

  editingLicense = signal<ResponseLicense | null>(null);
  saveSuccess = signal(false);
  savedLicenseType = signal('');
  sent = signal(false);
  saving = signal(false);
  formError = signal('');

  statusUpdatingUuid = signal<string | null>(null);
  showRejectConfirm = signal(false);
  rejectingLicense = signal<ResponseLicense | null>(null);
  rejectError = signal('');

  typeOptions = LICENSE_TYPE_OPTIONS;
  periodOptions = LICENSE_PERIOD_OPTIONS;

  form: FormGroup = new FormGroup({
    licensetype: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    licenseperiod: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    licensedate: new FormControl<string>(''),
    licensestarttime: new FormControl<string>(''),
    licenseendtime: new FormControl<string>(''),
    licensestartdate: new FormControl<string>(''),
    licenseenddate: new FormControl<string>(''),
  });

  selectedPeriod = computed(() => this.periodValue());
  private periodValue = signal<string>('');

  private licenseService = inject(LicenseService);

  ngOnInit(): void {
    this.form.get('licenseperiod')?.valueChanges.subscribe(v => this.periodValue.set(v ?? ''));
    this.getLicenses();
  }

  close() {
    this.closed.emit();
  }

  getLicenses() {
    if (!this.useruuid()) return;
    this.loadingList.set(true);
    this.listError.set('');
    this.licenseService.findAllByUser(this.useruuid()).subscribe({
      next: (response) => {
        this.licenses.set(response);
        this.loadingList.set(false);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.listError.set(body?.message || 'No se pudieron cargar las licencias. Inténtalo nuevamente.');
        this.loadingList.set(false);
      },
    });
  }

  typeConfig(type: string) {
    return LICENSE_TYPE_MAP[type] ?? LICENSE_TYPE_MAP['other'];
  }

  formatDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  periodSummary(license: ResponseLicense): string {
    if (license.licenseperiod === 'time') {
      return `${this.formatDate(license.licensedate)} · ${license.licensestarttime ?? ''} - ${license.licenseendtime ?? ''}`;
    }
    if (license.licenseperiod === 'day') {
      return `${this.formatDate(license.licensedate)} · Día completo`;
    }
    return `${this.formatDate(license.licensestartdate)} - ${this.formatDate(license.licenseenddate)}`;
  }

  statusConfig(status: string) {
    return LICENSE_STATUS_MAP[status] ?? LICENSE_STATUS_MAP['expired'];
  }

  licenseActionItems(license: ResponseLicense): ActionMenuItem[] {
    const items: ActionMenuItem[] = [
      { key: 'edit', label: 'Editar', icon: 'pen' },
    ];
    if (license.licensestatus === 'requested') {
      items.push({ key: 'approve', label: 'Aprobar', icon: 'check' });
    }
    if (license.licensestatus === 'requested' || license.licensestatus === 'approved') {
      items.push({ key: 'reject', label: 'Rechazar', icon: 'xmark', variant: 'danger' });
    }
    return items;
  }

  onLicenseAction(action: string, license: ResponseLicense) {
    switch (action) {
      case 'edit': this.openEditLicense(license); break;
      case 'approve': this.approveLicense(license); break;
      case 'reject': this.openRejectLicense(license); break;
    }
  }

  openCreateLicense() {
    this.editingLicense.set(null);
    this.saveSuccess.set(false);
    this.sent.set(false);
    this.formError.set('');
    this.form.reset({
      licensetype: '', licenseperiod: '', licensedate: '', licensestarttime: '',
      licenseendtime: '', licensestartdate: '', licenseenddate: '',
    });
    this.view.set('form');
  }

  openEditLicense(license: ResponseLicense) {
    this.editingLicense.set(license);
    this.saveSuccess.set(false);
    this.sent.set(false);
    this.formError.set('');
    this.form.reset({
      licensetype: license.licensetype,
      licenseperiod: license.licenseperiod,
      licensedate: license.licensedate ?? '',
      licensestarttime: license.licensestarttime ?? '',
      licenseendtime: license.licenseendtime ?? '',
      licensestartdate: license.licensestartdate ? this.toDateInput(license.licensestartdate) : '',
      licenseenddate: license.licenseenddate ? this.toDateInput(license.licenseenddate) : '',
    });
    this.view.set('form');
  }

  backToList() {
    this.view.set('list');
    this.editingLicense.set(null);
    this.saveSuccess.set(false);
  }

  private toDateInput(value: string | Date): string {
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }

  get typeError(): string {
    if (!this.sent()) return '';
    if (this.form.get('licensetype')?.errors?.['required']) return 'Selecciona el tipo de licencia';
    return '';
  }

  get periodError(): string {
    if (!this.sent()) return '';
    if (this.form.get('licenseperiod')?.errors?.['required']) return 'Selecciona el periodo de la licencia';
    return '';
  }

  get dateError(): string {
    if (!this.sent()) return '';
    if ((this.selectedPeriod() === 'day' || this.selectedPeriod() === 'time') && !this.form.value.licensedate) return 'La fecha es requerida';
    return '';
  }

  get startTimeError(): string {
    if (!this.sent()) return '';
    if (this.selectedPeriod() === 'time' && !this.form.value.licensestarttime) return 'La hora de inicio es requerida';
    return '';
  }

  get endTimeError(): string {
    if (!this.sent()) return '';
    if (this.selectedPeriod() === 'time') {
      if (!this.form.value.licenseendtime) return 'La hora de fin es requerida';
      if (this.form.value.licensestarttime && this.form.value.licenseendtime <= this.form.value.licensestarttime) return 'Debe ser posterior a la hora de inicio';
    }
    return '';
  }

  get startDateError(): string {
    if (!this.sent()) return '';
    if (this.selectedPeriod() === 'period' && !this.form.value.licensestartdate) return 'La fecha de inicio es requerida';
    return '';
  }

  get endDateError(): string {
    if (!this.sent()) return '';
    if (this.selectedPeriod() === 'period') {
      if (!this.form.value.licenseenddate) return 'La fecha de fin es requerida';
      if (this.form.value.licensestartdate && this.form.value.licenseenddate < this.form.value.licensestartdate) return 'Debe ser posterior a la fecha de inicio';
    }
    return '';
  }

  private buildPayload(): CreateLicenseInterface | UpdateLicenseInterface | null {
    const v = this.form.value;
    const base = { licensetype: v.licensetype, licenseperiod: v.licenseperiod };

    if (v.licenseperiod === 'time') {
      if (this.dateError || this.startTimeError || this.endTimeError) return null;
      return { ...base, licensedate: v.licensedate, licensestarttime: v.licensestarttime, licenseendtime: v.licenseendtime };
    }
    if (v.licenseperiod === 'day') {
      if (this.dateError) return null;
      return { ...base, licensedate: v.licensedate };
    }
    if (v.licenseperiod === 'period') {
      if (this.startDateError || this.endDateError) return null;
      return { ...base, licensestartdate: v.licensestartdate, licenseenddate: v.licenseenddate };
    }
    return null;
  }

  submit() {
    this.sent.set(true);
    if (this.form.get('licensetype')?.invalid || this.form.get('licenseperiod')?.invalid) return;

    const payload = this.buildPayload();
    if (!payload) return;

    this.saving.set(true);
    this.formError.set('');

    const licensetype = payload.licensetype;
    const editing = this.editingLicense();
    if (editing) {
      this.licenseService.update(editing.licenseuuid, payload as UpdateLicenseInterface).subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set(true);
          this.savedLicenseType.set(licensetype);
          this.getLicenses();
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.formError.set(body?.message || 'No se pudo actualizar la licencia. Inténtalo nuevamente.');
          this.saving.set(false);
        },
      });
    } else {
      this.licenseService.create({ ...payload, useruuid: this.useruuid() } as CreateLicenseInterface).subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set(true);
          this.savedLicenseType.set(licensetype);
          this.getLicenses();
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.formError.set(body?.message || 'No se pudo registrar la licencia. Inténtalo nuevamente.');
          this.saving.set(false);
        },
      });
    }
  }

  approveLicense(license: ResponseLicense) {
    this.statusUpdatingUuid.set(license.licenseuuid);
    this.licenseService.updateStatus(license.licenseuuid, { licensestatus: 'approved' }).subscribe({
      next: () => {
        this.licenses.update(ls => ls.map(l => l.licenseuuid === license.licenseuuid ? { ...l, licensestatus: 'approved' } : l));
        this.statusUpdatingUuid.set(null);
      },
      error: () => { this.statusUpdatingUuid.set(null); },
    });
  }

  openRejectLicense(license: ResponseLicense) {
    this.rejectingLicense.set(license);
    this.rejectError.set('');
    this.showRejectConfirm.set(true);
  }

  onRejectCancelled() {
    this.showRejectConfirm.set(false);
    this.rejectingLicense.set(null);
  }

  onRejectConfirmed() {
    const license = this.rejectingLicense();
    if (!license) return;
    this.statusUpdatingUuid.set(license.licenseuuid);
    this.rejectError.set('');
    this.licenseService.updateStatus(license.licenseuuid, { licensestatus: 'rechazado' }).subscribe({
      next: () => {
        this.licenses.update(ls => ls.map(l => l.licenseuuid === license.licenseuuid ? { ...l, licensestatus: 'rechazado' } : l));
        this.statusUpdatingUuid.set(null);
        this.showRejectConfirm.set(false);
        this.rejectingLicense.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.rejectError.set(body?.message || 'No se pudo rechazar la licencia. Inténtalo nuevamente.');
        this.statusUpdatingUuid.set(null);
      },
    });
  }

}
