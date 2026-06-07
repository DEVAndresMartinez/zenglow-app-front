import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appNumbersOnly]',
    standalone: true
})
export class NumbersOnlyCase {
    private specialKeys: string[] = [
        'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];

    constructor(private el: ElementRef) { }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        if (event.key >= '0' && event.key <= '9') {
            return;
        }
        event.preventDefault();
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedInput: string = event.clipboardData?.getData('text/plain') || '';

        const sanitized = pastedInput.replace(/[^0-9]/g, '');

        document.execCommand('insertText', false, sanitized);
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent): void {
        event.preventDefault();
        const textData = event.dataTransfer?.getData('text') || '';

        const sanitized = textData.replace(/[^0-9]/g, '');

        document.execCommand('insertText', false, sanitized);
    }
}
