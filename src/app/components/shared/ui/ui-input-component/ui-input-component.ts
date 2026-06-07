import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, signal, computed } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType =
  | 'text' | 'email' | 'password' | 'number' | 'tel'
  | 'url' | 'search' | 'textarea'
  | 'date' | 'datetime-local' | 'time' | 'color';

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

  // Internal state
  value = signal('');
  isDisabled = signal(false);
  showPassword = signal(false);

  isTextarea = computed(() => this.type() === 'textarea');
  isPassword = computed(() => this.type() === 'password');
  visibleType = computed(() =>
    this.isPassword() && this.showPassword() ? 'text' : this.type()
  );

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

  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
