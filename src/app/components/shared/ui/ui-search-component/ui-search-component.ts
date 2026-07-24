import { Component, OnDestroy, input, output, signal, computed } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ui-search-component',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './ui-search-component.html',
  styleUrl: './ui-search-component.scss',
})
export class UISearchComponent implements OnDestroy {
  placeholder = input('Buscar...');
  debounceMs = input(300);

  search = output<string>();

  value = signal('');
  hasValue = computed(() => this.value().length > 0);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search.emit(val), this.debounceMs());
  }

  clear(): void {
    this.value.set('');
    this.search.emit('');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
}
