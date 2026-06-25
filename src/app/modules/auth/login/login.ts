import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UIInputComponent } from '../../../components/shared/ui/ui-input-component/ui-input-component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';

const COMPONENTS = [UIInputComponent];


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterLink, ...COMPONENTS],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  constructor() { }

  loginForm = new FormGroup({
    credential: new FormControl<string>('', { validators: [ Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    password: new FormControl<string>('', { validators: [ Validators.required, Validators.minLength(6)] })
  });

  submit() {
    if (this.loginForm.valid) {
      alert('Inicio exitoso')
    }
  }

}
