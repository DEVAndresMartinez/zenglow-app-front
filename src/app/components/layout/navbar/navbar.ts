import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommerceService } from '../../../core/services/modules/commerces/commerce.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  private auth = inject(AuthService);
  readonly commerceService = inject(CommerceService);

  lastLogin = signal<Date>(new Date(this.commerceService.me()?.user.userlastlogin ?? ''));

  constructor() { }

  logout() {
    this.auth.logout();
  }

}
