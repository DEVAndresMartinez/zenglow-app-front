import { Directive, HostListener, Input, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
    selector: '[appCurrencyInput]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CurrencyInputDirective),
            multi: true
        }
    ]
})
export class CurrencyInputDirective implements ControlValueAccessor {
    @Input() currencyCode = 'USD';

    private onChange: (value: number | null) => void = () => { };
    private onTouched: () => void = () => { };

    constructor(private el: ElementRef<HTMLInputElement>) { }

    writeValue(value: number | null): void {
        this.el.nativeElement.value = value != null ? this.formatCurrency(value) : '';
    }

    registerOnChange(fn: (value: number | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value;
        const selectionStart = input.selectionStart ?? 0;
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        }
        if (parts[1]?.length > 2) {
            parts[1] = parts[1].substring(0, 2);
            value = parts.join('.');
        }
        const numericValue = parseFloat(value);
        this.onChange(isNaN(numericValue) ? null : numericValue);
        const formatted = this.formatPartial(value);
        const diff = formatted.length - input.value.length;
        input.value = formatted;
        input.setSelectionRange(selectionStart + diff, selectionStart + diff);
    }

    @HostListener('blur')
    onBlur() {
        this.onTouched();
        const value = parseFloat(this.el.nativeElement.value.replace(/,/g, ''));
        if (!isNaN(value)) {
            this.el.nativeElement.value = this.formatCurrency(value);
        } else {
            this.el.nativeElement.value = '';
        }
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    private formatPartial(value: string): string {
        const [intPart, decPart] = value.split('.');
        const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decPart !== undefined ? intFormatted + '.' + decPart : intFormatted;
    }
}
