import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  hint?: string;
}

@Component({
  selector: 'ui-action-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './ui-action-menu.html',
})
export class UIActionMenuComponent {

  items = input<ActionMenuItem[]>([]);

  action = output<string>();

  isOpen = signal(false);
  panelStyle = signal<Record<string, string>>({});

  @ViewChild('triggerBtn') triggerBtn!: ElementRef<HTMLButtonElement>;

  constructor(private el: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el?.nativeElement?.contains(e.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.isOpen()) this.isOpen.set(false);
  }

  toggle() {
    if (!this.isOpen()) this.calculatePanelStyle();
    this.isOpen.update(v => !v);
  }

  select(item: ActionMenuItem) {
    if (item.disabled) return;
    this.isOpen.set(false);
    this.action.emit(item.key);
  }

  private calculatePanelStyle() {
    const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
    const panelWidth = 208;
    const panelHeight = this.items().length * 40 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight && rect.top > panelHeight;

    this.panelStyle.set({
      position: 'fixed',
      ...(openUpward
        ? { bottom: `${window.innerHeight - rect.top + 4}px` }
        : { top: `${rect.bottom + 4}px` }),
      right: `${window.innerWidth - rect.right}px`,
      width: `${panelWidth}px`,
      zIndex: '9999',
    });
  }
}
