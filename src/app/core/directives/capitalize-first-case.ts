import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCapitalizeFirst]',
  standalone: true
})
export class CapitalizeFirst {

  constructor(@Optional() @Self() private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const capitalized = this.capitalizeFirstLetter(input.value);
    if (input.value === capitalized) return;
    input.value = capitalized;
    this.ngControl?.control?.setValue(capitalized, { emitEvent: false });
  }

  private capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

}
