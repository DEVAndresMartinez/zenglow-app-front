import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercase]'
})
export class UpperCase {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const target = this.el.nativeElement as HTMLInputElement;
    target.value = target.value.toUpperCase();
  }

}
