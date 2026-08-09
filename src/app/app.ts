import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs';
import { CommerceService } from './core/services/modules/commerce.service';
import { ThemeService } from './core/services/theme.service';
import { ChangePasswordModalComponent } from './components/shared/ui/change-password-modal/change-password-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FontAwesomeModule, ChangePasswordModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);

  readonly commerceService = inject(CommerceService);
  private themeService = inject(ThemeService);

  constructor(library: FaIconLibrary) {
    this.setDynamicTitle();
    library.addIconPacks(fas, far, fab);
  }

  setDynamicTitle() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap((route) => route.data)
    ).subscribe((data) => {
      const title = data['title'] ? data['title'] : 'PractiSistema POS';
      this.titleService.setTitle(title);
    })
  }

}
