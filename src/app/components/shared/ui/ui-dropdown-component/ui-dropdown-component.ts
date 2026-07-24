import { Component, forwardRef, input, output, signal, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
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

  selectionChange = output<DropdownOption | DropdownOption[] | null>();

  isOpen = signal(false);
  search = signal('');
  isDisabled = signal(false);
  panelStyle = signal<Record<string, string>>({});

  @ViewChild('triggerBtn') triggerBtn!: ElementRef<HTMLButtonElement>;

  private _value = signal<string | number | (string | number)[] | null>(null);

  private onChange: (v: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private el: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el?.nativeElement?.contains(e.target)) {
      this.isOpen.set(false);
      this.search.set('');
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.isOpen()) {
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
      this.selectionChange.emit(this.options().filter(o => next.includes(o.abv)));
    } else {
      this._value.set(opt.abv);
      this.onChange(opt.abv);
      this.isOpen.set(false);
      this.search.set('');
      this.selectionChange.emit(opt);
    }
    this.onTouched();
  }

  toggle() {
    if (this.isDisabled()) return;
    if (!this.isOpen()) {
      this.calculatePanelStyle();
    }
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.search.set('');
  }

  private calculatePanelStyle() {
    const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
    const panelHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight && rect.top > panelHeight;

    if (openUpward) {
      this.panelStyle.set({
        position: 'fixed',
        bottom: `${window.innerHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: '9999',
      });
    } else {
      this.panelStyle.set({
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: '9999',
      });
    }
  }

  clear(e: MouseEvent) {
    e.stopPropagation();
    this._value.set(this.multiple() ? [] : null);
    this.onChange(this.multiple() ? [] : null);
    this.onTouched();
    this.selectionChange.emit(this.multiple() ? [] : null);
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
