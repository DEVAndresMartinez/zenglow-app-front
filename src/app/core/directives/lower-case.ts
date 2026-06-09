import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appLowercase]',
  standalone: true
})
export class Lowercase {

  constructor(@Optional() @Self() private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lower = input.value.toLowerCase();
    if (input.value === lower) return;
    input.value = lower;
    this.ngControl?.control?.setValue(lower, { emitEvent: false });
  }
}
