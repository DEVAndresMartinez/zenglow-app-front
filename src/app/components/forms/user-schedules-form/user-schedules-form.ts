import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { ActionMenuItem, UIActionMenuComponent } from '../../shared/ui/ui-action-menu/ui-action-menu';
import { UIConfirmModalComponent } from '../../shared/ui/ui-confirm-modal/ui-confirm-modal';
import { ScheduleService } from '../../../core/services/modules/schedule.service';
import { CreateScheduleInterface, ResponseSchedule, UpdateScheduleInterface } from '../../../core/interfaces/schedule.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

type ScheduleView = 'list' | 'form';

const DAY_OPTIONS: DropdownOption[] = [
  { abv: 'Monday', name: 'Lunes' },
  { abv: 'Tuesday', name: 'Martes' },
  { abv: 'Wednesday', name: 'Miércoles' },
  { abv: 'Thursday', name: 'Jueves' },
  { abv: 'Friday', name: 'Viernes' },
  { abv: 'Saturday', name: 'Sábado' },
  { abv: 'Sunday', name: 'Domingo' },
];

const DAY_LABELS: Record<string, string> = {
  Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles', Thursday: 'Jueves',
  Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
};

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activo', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactivo', classes: 'bg-stroke/40 text-muted border-stroke' },
  deleted: { label: 'Eliminado', classes: 'bg-error/10 text-error border-error/30' },
};

@Component({
  selector: 'app-user-schedules-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent, UIInputComponent, UIActionMenuComponent, UIConfirmModalComponent],
  templateUrl: './user-schedules-form.html',
})
export class UserSchedulesForm implements OnInit {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  closed = output();

  view = signal<ScheduleView>('list');

  schedules = signal<ResponseSchedule[]>([]);
  loadingList = signal(false);
  listError = signal('');

  editingSchedule = signal<ResponseSchedule | null>(null);
  saveSuccess = signal(false);
  sent = signal(false);
  saving = signal(false);
  formError = signal('');

  statusUpdatingUuid = signal<string | null>(null);
  showDeactivateConfirm = signal(false);
  togglingSchedule = signal<ResponseSchedule | null>(null);
  toggleError = signal('');

  dayOptions = DAY_OPTIONS;

  form: FormGroup = new FormGroup({
    scheduledayofweek: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    schedulestarttime: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    scheduleendtime: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  private scheduleService = inject(ScheduleService);

  ngOnInit(): void {
    this.getSchedules();
  }

  close() {
    this.closed.emit();
  }

  getSchedules() {
    if (!this.useruuid()) return;
    this.loadingList.set(true);
    this.listError.set('');
    this.scheduleService.getAllSchedulesByUser(this.useruuid()).subscribe({
      next: (response) => {
        this.schedules.set(response);
        this.loadingList.set(false);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.listError.set(body?.message || 'No se pudieron cargar los horarios. Inténtalo nuevamente.');
        this.loadingList.set(false);
      },
    });
  }

  dayLabel(day: string): string {
    return DAY_LABELS[day] ?? day;
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['inactive'];
  }

  scheduleActionItems(schedule: ResponseSchedule): ActionMenuItem[] {
    return [
      { key: 'edit', label: 'Editar', icon: 'pen' },
      schedule.schedulestatus === 'active'
        ? { key: 'toggle', label: 'Desactivar', icon: 'toggle-off', variant: 'danger' }
        : { key: 'toggle', label: 'Activar', icon: 'toggle-on' },
    ];
  }

  onScheduleAction(action: string, schedule: ResponseSchedule) {
    switch (action) {
      case 'edit': this.openEditSchedule(schedule); break;
      case 'toggle': this.onToggleStatus(schedule); break;
    }
  }

  openCreateSchedule() {
    this.editingSchedule.set(null);
    this.saveSuccess.set(false);
    this.sent.set(false);
    this.formError.set('');
    this.form.reset({ scheduledayofweek: '', schedulestarttime: '', scheduleendtime: '' });
    this.view.set('form');
  }

  openEditSchedule(schedule: ResponseSchedule) {
    this.editingSchedule.set(schedule);
    this.saveSuccess.set(false);
    this.sent.set(false);
    this.formError.set('');
    this.form.reset({
      scheduledayofweek: schedule.scheduledayofweek,
      schedulestarttime: schedule.schedulestarttime,
      scheduleendtime: schedule.scheduleendtime,
    });
    this.view.set('form');
  }

  backToList() {
    this.view.set('list');
    this.editingSchedule.set(null);
    this.saveSuccess.set(false);
  }

  get dayError(): string {
    if (!this.sent()) return '';
    if (this.form.get('scheduledayofweek')?.errors?.['required']) return 'Selecciona el día';
    return '';
  }

  get startTimeError(): string {
    if (!this.sent()) return '';
    if (this.form.get('schedulestarttime')?.errors?.['required']) return 'La hora de inicio es requerida';
    return '';
  }

  get endTimeError(): string {
    if (!this.sent()) return '';
    if (this.form.get('scheduleendtime')?.errors?.['required']) return 'La hora de fin es requerida';
    if (this.form.value.schedulestarttime && this.form.value.scheduleendtime <= this.form.value.schedulestarttime) return 'Debe ser posterior a la hora de inicio';
    return '';
  }

  submit() {
    this.sent.set(true);
    if (this.form.invalid || this.endTimeError) return;

    this.saving.set(true);
    this.formError.set('');

    const payload = this.form.value as CreateScheduleInterface & UpdateScheduleInterface;
    const editing = this.editingSchedule();

    if (editing) {
      this.scheduleService.update(this.useruuid(), editing.scheduleuuid, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set(true);
          this.getSchedules();
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.formError.set(body?.message || 'No se pudo actualizar el horario. Inténtalo nuevamente.');
          this.saving.set(false);
        },
      });
    } else {
      this.scheduleService.create({ ...payload, useruuid: this.useruuid() }).subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set(true);
          this.getSchedules();
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorGlobalException;
          this.formError.set(body?.message || 'No se pudo registrar el horario. Inténtalo nuevamente.');
          this.saving.set(false);
        },
      });
    }
  }

  onToggleStatus(schedule: ResponseSchedule) {
    if (schedule.schedulestatus === 'active') {
      this.togglingSchedule.set(schedule);
      this.toggleError.set('');
      this.showDeactivateConfirm.set(true);
      return;
    }
    this.changeStatus(schedule);
  }

  onDeactivateCancelled() {
    this.showDeactivateConfirm.set(false);
    this.togglingSchedule.set(null);
  }

  onDeactivateConfirmed() {
    const schedule = this.togglingSchedule();
    if (!schedule) return;
    this.changeStatus(schedule, () => {
      this.showDeactivateConfirm.set(false);
      this.togglingSchedule.set(null);
    });
  }

  private changeStatus(schedule: ResponseSchedule, onDone?: () => void) {
    this.statusUpdatingUuid.set(schedule.scheduleuuid);
    this.toggleError.set('');
    this.scheduleService.changeStatus(schedule.scheduleuuid).subscribe({
      next: () => {
        this.statusUpdatingUuid.set(null);
        this.getSchedules();
        onDone?.();
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.toggleError.set(body?.message || 'No se pudo actualizar el estado del horario. Inténtalo nuevamente.');
        this.statusUpdatingUuid.set(null);
      },
    });
  }

}
