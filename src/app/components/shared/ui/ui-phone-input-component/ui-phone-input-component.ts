import { Component, forwardRef, input, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const MAX_DIGITS = 10;

@Component({
  selector: 'ui-phone-input-component',
  standalone: true,
  templateUrl: './ui-phone-input-component.html',
  styleUrl: './ui-phone-input-component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIPhoneInputComponent),
      multi: true,
    },
  ],
})
export class UIPhoneInputComponent implements ControlValueAccessor {
  label      = input('');
  hint       = input('');
  error      = input('');
  required   = input(false);
  countryCode = input('+57');

  digits     = signal('');
  isDisabled = signal(false);

  fullValue  = computed(() => `${this.countryCode()}${this.digits()}`);
  remaining  = computed(() => MAX_DIGITS - this.digits().length);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(e: Event): void {
    const raw   = (e.target as HTMLInputElement).value;
    const clean = raw.replace(/\D/g, '').slice(0, MAX_DIGITS);
    this.digits.set(clean);
    // sync input visually in case we truncated
    (e.target as HTMLInputElement).value = clean;
    this.onChange(this.fullValue());
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(v: string): void {
    const code  = this.countryCode();
    const clean = (v ?? '').replace(/\D/g, '');
    // strip the country code digits if present
    const codeDigits = code.replace(/\D/g, '');
    const digits = clean.startsWith(codeDigits)
      ? clean.slice(codeDigits.length)
      : clean;
    this.digits.set(digits.slice(0, MAX_DIGITS));
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled.set(d); }
}
