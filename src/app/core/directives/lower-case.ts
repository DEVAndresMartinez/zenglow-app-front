import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLowercase]'
})
export class Lowercase {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = this.toLowerCase(input.value);
  }

  private toLowerCase(value: string): string {
    return value.toLowerCase();
  }
}
