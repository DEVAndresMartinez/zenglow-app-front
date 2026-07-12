import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export type ConfirmModalVariant = 'danger' | 'primary';

@Component({
  selector: 'ui-confirm-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './ui-confirm-modal.html',
})
export class UIConfirmModalComponent {

  title = input('¿Estás seguro?');
  message = input('Esta acción no se puede deshacer.');
  confirmText = input('Confirmar');
  cancelText = input('Cancelar');
  variant = input<ConfirmModalVariant>('danger');
  icon = input('trash');
  loading = input(false);
  error = input('');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    if (this.loading()) return;
    this.cancelled.emit();
  }
}
