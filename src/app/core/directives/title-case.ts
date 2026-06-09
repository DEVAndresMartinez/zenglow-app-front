import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTitleCase]',
  standalone: true
})
export class TitleCase {

  constructor(@Optional() @Self() private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const titled = this.toTitleCase(input.value);
    if (input.value === titled) return;
    input.value = titled;
    this.ngControl?.control?.setValue(titled, { emitEvent: false });
  }

  private toTitleCase(value: string): string {
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

}
