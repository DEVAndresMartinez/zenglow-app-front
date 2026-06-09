import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UpperCase {

  constructor(@Optional() @Self() private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (input.value === upper) return;
    input.value = upper;
    this.ngControl?.control?.setValue(upper, { emitEvent: false });
  }

}
