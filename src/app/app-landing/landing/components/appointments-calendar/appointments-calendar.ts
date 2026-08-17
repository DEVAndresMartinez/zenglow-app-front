import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppointmentLandingDto } from '../../../core/interfaces/landing.interface';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarBlock {
  appointment: AppointmentLandingDto;
  start: Date;
  topPercent: number;
  heightPercent: number;
  label: string;
}

interface MonthCell {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  appointments: AppointmentLandingDto[];
}

// Rango de horas visible en las vistas de día/semana. Las citas fuera de
// este rango quedan ancladas al borde superior en vez de desaparecer.
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const HOURS_RANGE = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

/**
 * Calendario de citas (día/semana/mes) para la landing pública de un comercio.
 *
 * AppointmentLandingDto no referencia qué usuario o servicio corresponde a
 * cada cita (solo fecha/hora/duración/estado), así que cada cita se muestra
 * como un bloque de ocupación anónimo. Cuando el backend agregue esa
 * relación, este componente es el punto para enriquecer los bloques.
 */
@Component({
  selector: 'landing-appointments-calendar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './appointments-calendar.html',
})
export class AppointmentsCalendarComponent {

  appointments = input<AppointmentLandingDto[]>([]);

  readonly hoursRange = HOURS_RANGE;
  readonly viewOptions: { key: CalendarView; label: string }[] = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
  ];

  view = signal<CalendarView>('week');
  referenceDate = signal<Date>(new Date());

  private today = new Date();

  hourMarks = computed(() =>
    this.hoursRange.map((hour, i) => ({ hour, percent: (i / (this.hoursRange.length - 1)) * 100 }))
  );

  periodLabel = computed(() => {
    const date = this.referenceDate();
    switch (this.view()) {
      case 'day':
        return this.capitalize(this.format(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
      case 'month':
        return this.capitalize(this.format(date, { month: 'long', year: 'numeric' }));
      default: {
        const { start, end } = this.weekRange(date);
        const startLabel = this.format(start, { day: 'numeric', month: 'short' });
        const endLabel = this.format(end, { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startLabel} – ${endLabel}`;
      }
    }
  });

  weekDays = computed(() => {
    const { start } = this.weekRange(this.referenceDate());
    return Array.from({ length: 7 }, (_, i) => this.addDays(start, i));
  });

  monthGrid = computed<MonthCell[]>(() => {
    const ref = this.referenceDate();
    const firstOfMonth = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Lunes = 0
    const gridStart = this.addDays(firstOfMonth, -firstWeekday);

    return Array.from({ length: 42 }, (_, i) => {
      const date = this.addDays(gridStart, i);
      return {
        date,
        inCurrentMonth: date.getMonth() === ref.getMonth(),
        isToday: this.isSameDay(date, this.today),
        appointments: this.appointmentsForDay(date),
      };
    });
  });

  dayBlocks = computed(() => this.blocksForDay(this.referenceDate()));

  weekBlocksByDay = computed(() => this.weekDays().map(date => this.blocksForDay(date)));

  setView(view: CalendarView): void {
    this.view.set(view);
  }

  goToday(): void {
    this.referenceDate.set(new Date());
  }

  goPrev(): void {
    this.shift(-1);
  }

  goNext(): void {
    this.shift(1);
  }

  selectDay(date: Date): void {
    this.referenceDate.set(date);
    this.view.set('day');
  }

  statusClasses(status: string): string {
    switch ((status ?? '').toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return 'bg-primary/15 border-primary text-primary';
      case 'completed':
      case 'completada':
        return 'bg-accent/15 border-accent-hover text-accent-hover';
      case 'cancelled':
      case 'cancelada':
        return 'bg-error/10 border-error text-error';
      case 'pending':
      case 'pendiente':
        return 'bg-warning-soft border-warning-hover text-warning-hover';
      default:
        return 'bg-surface-hover border-stroke text-muted';
    }
  }

  weekdayLabel(date: Date): string {
    return this.capitalize(this.format(date, { weekday: 'short' }));
  }

  dayNumberLabel(date: Date): string {
    return this.format(date, { day: 'numeric' });
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, this.today);
  }

  private shift(direction: 1 | -1): void {
    const date = this.referenceDate();
    switch (this.view()) {
      case 'day':
        this.referenceDate.set(this.addDays(date, direction));
        break;
      case 'week':
        this.referenceDate.set(this.addDays(date, direction * 7));
        break;
      case 'month':
        this.referenceDate.set(new Date(date.getFullYear(), date.getMonth() + direction, 1));
        break;
    }
  }

  private appointmentsForDay(date: Date): AppointmentLandingDto[] {
    return this.appointments().filter(a => this.isSameDay(this.parseDate(a.appointmentdate), date));
  }

  private blocksForDay(date: Date): CalendarBlock[] {
    const dayStartMinutes = DAY_START_HOUR * 60;
    const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;

    return this.appointmentsForDay(date)
      .map(appointment => {
        const start = this.combineDateTime(appointment.appointmentdate, appointment.appointmenthour);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = appointment.appointmentduration ?? 30;
        const end = new Date(start.getTime() + duration * 60000);

        return {
          appointment,
          start,
          topPercent: Math.max(0, ((startMinutes - dayStartMinutes) / totalMinutes) * 100),
          heightPercent: Math.max(4, (duration / totalMinutes) * 100),
          label: `${this.format(start, { hour: 'numeric', minute: '2-digit' })} – ${this.format(end, { hour: 'numeric', minute: '2-digit' })}`,
        };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  // Asume appointmentdate en formato ISO ('YYYY-MM-DD', con o sin hora) y
  // appointmenthour tipo 'HH:mm' (o 'HH:mm:ss'). Ajustar aquí si el backend
  // cambia el formato.
  private combineDateTime(dateStr: string, hourStr: string): Date {
    const datePart = (dateStr ?? '').split('T')[0];
    const timePart = (hourStr ?? '00:00').slice(0, 5);
    const parsed = new Date(`${datePart}T${timePart}:00`);
    return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
  }

  private parseDate(dateStr: string): Date {
    const datePart = (dateStr ?? '').split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date(dateStr);
  }

  private weekRange(date: Date): { start: Date; end: Date } {
    const weekday = (date.getDay() + 6) % 7; // Lunes = 0
    const start = this.addDays(date, -weekday);
    return { start, end: this.addDays(start, 6) };
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private format(date: Date, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CO', options).format(date);
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
