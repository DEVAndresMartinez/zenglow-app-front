import { Component, forwardRef, input, signal, computed, HostListener, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  abv: string;
  name: string;
}

@Component({
  selector: 'ui-dropdown-component',
  standalone: true,
  templateUrl: './ui-dropdown-component.html',
  styleUrl: './ui-dropdown-component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIDropdownComponent),
      multi: true,
    },
  ],
})
export class UIDropdownComponent implements ControlValueAccessor {
  label = input('');
  placeholder = input('Seleccionar...');
  options = input<DropdownOption[]>([]);
  multiple = input(false);
  required = input(false);
  hint = input('');
  error = input('');

  isOpen = signal(false);
  search = signal('');
  isDisabled = signal(false);

  // single → string | number | null ; multiple → array
  private _value = signal<string | number | (string | number)[] | null>(null);

  private onChange: (v: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private el: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen.set(false);
      this.search.set('');
    }
  }

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return q
      ? this.options().filter(o => o.name.toLowerCase().includes(q))
      : this.options();
  });

  displayValue = computed(() => {
    const v = this._value();
    if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) return '';
    if (this.multiple()) {
      const vals = v as (string | number)[];
      return this.options()
        .filter(o => vals.includes(o.abv))
        .map(o => o.name)
        .join(', ');
    }
    return this.options().find(o => o.abv === v)?.name ?? '';
  });

  isSelected(opt: DropdownOption): boolean {
    const v = this._value();
    if (this.multiple()) return Array.isArray(v) && v.includes(opt.abv);
    return v === opt.abv;
  }

  select(opt: DropdownOption) {
    if (this.multiple()) {
      const current = (Array.isArray(this._value()) ? this._value() : []) as (string | number)[];
      const next = current.includes(opt.abv)
        ? current.filter(v => v !== opt.abv)
        : [...current, opt.abv];
      this._value.set(next);
      this.onChange(next);
    } else {
      this._value.set(opt.abv);
      this.onChange(opt.abv);
      this.isOpen.set(false);
      this.search.set('');
    }
    this.onTouched();
  }

  toggle() {
    if (this.isDisabled()) return;
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.search.set('');
  }

  clear(e: MouseEvent) {
    e.stopPropagation();
    this._value.set(this.multiple() ? [] : null);
    this.onChange(this.multiple() ? [] : null);
    this.onTouched();
  }

  onSearchInput(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  writeValue(v: any): void {
    this._value.set(v ?? (this.multiple() ? [] : null));
  }

  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled.set(d); }
}
