import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTitleCase]'
})
export class TitleCase {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const target = this.el.nativeElement as HTMLInputElement;
    target.value = this.toTitleCase(target.value);
  }

  private toTitleCase(value: string): string {
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

}
