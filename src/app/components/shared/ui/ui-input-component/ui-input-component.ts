import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, input, signal, computed, viewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType =
  | 'text' | 'email' | 'password' | 'number' | 'tel'
  | 'url' | 'search' | 'textarea'
  | 'date' | 'datetime-local' | 'time' | 'color'
  | 'currency';

@Component({
  selector: 'ui-input-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,],
  templateUrl: './ui-input-component.html',
  styleUrl: './ui-input-component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIInputComponent),
      multi: true,
    },
  ],
})
export class UIInputComponent implements ControlValueAccessor {
  // Inputs
  type = input<InputType>('text');
  label = input('');
  placeholder = input('');
  hint = input('');
  error = input('');
  icon = input('');
  required = input(false);
  readonly = input(false);
  maxlength = input<number | null>(null);
  minlength = input<number | null>(null);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number | null>(null);
  currencyCode = input('USD');

  // Internal state
  value = signal('');
  isDisabled = signal(false);
  showPassword = signal(false);

  private nativeInput = viewChild<ElementRef<HTMLInputElement>>('inputRef');
  private rawCurrencyValue: number | null = null;

  isTextarea = computed(() => this.type() === 'textarea');
  isPassword = computed(() => this.type() === 'password');
  isCurrency = computed(() => this.type() === 'currency');
  visibleType = computed(() => {
    if (this.isCurrency()) return 'text';
    return this.isPassword() && this.showPassword() ? 'text' : this.type();
  });

  // Password strength
  hasMinLength = computed(() => this.value().length >= 8);
  hasLower = computed(() => /[a-z]/.test(this.value()));
  hasUpper = computed(() => /[A-Z]/.test(this.value()));
  hasNumber = computed(() => /[0-9]/.test(this.value()));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.value()));
  strength = computed(() =>
    [this.hasMinLength(), this.hasLower(), this.hasUpper(), this.hasNumber(), this.hasSpecial()]
      .filter(Boolean).length
  );

  private onChange: (v: string | number | null) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: string | number | null): void {
    if (this.isCurrency()) {
      this.rawCurrencyValue = typeof value === 'number' ? value : (value ? parseFloat(value) : null);
      this.value.set(this.rawCurrencyValue != null ? this.formatCurrency(this.rawCurrencyValue) : '');
      return;
    }
    this.value.set((value as string) ?? '');
  }

  registerOnChange(fn: (v: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isCurrency()) {
      this.onCurrencyInput(input);
      return;
    }
    this.value.set(input.value);
    this.onChange(input.value);
  }

  onBlur(): void {
    this.onTouched();
    if (this.isCurrency() && this.rawCurrencyValue != null) {
      this.value.set(this.formatCurrency(this.rawCurrencyValue));
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  private onCurrencyInput(input: HTMLInputElement): void {
    const selectionStart = input.selectionStart ?? 0;
    let raw = input.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts[1];
    if (parts[1]?.length > 2) {
      parts[1] = parts[1].substring(0, 2);
      raw = parts.join('.');
    }

    const numericValue = parseFloat(raw);
    this.rawCurrencyValue = isNaN(numericValue) ? null : numericValue;
    this.onChange(this.rawCurrencyValue);

    const formatted = this.formatPartial(raw);
    const diff = formatted.length - input.value.length;
    this.value.set(formatted);

    const nativeEl = this.nativeInput()?.nativeElement;
    if (nativeEl) {
      queueMicrotask(() => {
        const pos = selectionStart + diff;
        nativeEl.setSelectionRange(pos, pos);
      });
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currencyCode(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatPartial(value: string): string {
    const [intPart, decPart] = value.split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? intFormatted + '.' + decPart : intFormatted;
  }
}
