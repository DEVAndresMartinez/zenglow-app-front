import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface TabItem {
  label: string;
  icon?: IconProp;
  link?: string;
  key?: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  @Input() tabs: TabItem[] = [];
  @Input() mode: 'route' | 'variable' = 'route';
  @Input() activeKey: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tab: TabItem): void {
    if (tab.key) this.tabChange.emit(tab.key);
  }
}
