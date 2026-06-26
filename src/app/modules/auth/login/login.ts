import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest, LoginResponse } from '../../../core/interfaces/auth.interface';
import { ErrorAuthException } from '../../../core/exceptions/auth.interface';
import { CommerceService } from '../../../core/services/modules/commerce.service';

const COMPONENTS = [UIInputComponent];


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterLink, ...COMPONENTS],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private auth = inject(AuthService);
  private commerceService = inject(CommerceService);
  private router = inject(Router);

  constructor() { }

  loginForm = new FormGroup({
    identifier: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    password: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  submit() {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value as LoginRequest).subscribe({
        next: (response: LoginResponse) => {
          this.auth.saveTokens(response.access_token, response.refresh_token);
          this.commerceService.loadMe();
          this.router.navigateByUrl('/modules/common/home', { replaceUrl: true });
        },
        error: (httpErr: HttpErrorResponse) => {
          const body = httpErr.error as ErrorAuthException;
          this.handleError(body.error, body.message);
        }
      });
    }
  }

  handleError(error: string, message?: string) {
    if (error === 'EC_AUTH') {
      alert('Usuario o contraseña incorrecta!!!');
    }
  }

}
