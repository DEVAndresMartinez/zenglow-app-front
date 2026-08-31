import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { UIPhoneInputComponent } from '../../shared/ui/ui-phone-input-component/ui-phone-input-component';
import { UserService } from '../../../core/services/modules/user.service';
import { BranchService } from '../../../core/services/modules/branch.service';
import { STATUS_USER_AVAILABLE } from '../../../core/const/register-const';
import { BranchesInterface } from '../../../core/interfaces/branch.interface';
import { CreateUserInterface, UpdateUserInterface, UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  blocked: 'Bloqueado',
  pending: 'Pendiente',
  deleted: 'Eliminado',
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent, UIDropdownComponent, UIPhoneInputComponent],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm {

  isEdit = input(false);
  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  saved = output<UsersInterface>();
  closed = output();

  responseUser = signal<UsersInterface | null>(null);
  error = signal<string>('');
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  branches = signal<BranchesInterface[]>([]);
  loadingBranches = signal<boolean>(false);

  branchOptions = computed<DropdownOption[]>(() =>
    this.branches().map(b => ({ abv: b.branchuuid, name: b.branchname }))
  );

  statusOptions: DropdownOption[] = STATUS_USER_AVAILABLE.map(s => ({ abv: s, name: STATUS_LABELS[s] ?? s }));

  userForm: FormGroup = new FormGroup({
    userfirstname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)] }),
    userlastname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)] }),
    username: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)] }),
    useremail: new FormControl<string>('', { validators: [Validators.required, Validators.email] }),
    userphone: new FormControl<string>(''),
    branchuuid: new FormControl<string>('', { validators: [Validators.required] }),
    userstatus: new FormControl<string>('active'),
    userspecialty: new FormControl<string>('', { validators: [Validators.maxLength(100)] }),
  });

  private userService = inject(UserService);
  private branchService = inject(BranchService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);
    if (this.isEdit() && this.user() !== null) {
      ['username', 'userpassword', 'branchuuid'].forEach(key => {
        this.userForm.get(key)?.clearValidators();
        this.userForm.get(key)?.updateValueAndValidity();
      });
      this.userForm.patchValue({
        userfirstname: this.user()?.userfirstname,
        userlastname: this.user()?.userlastname,
        useremail: this.user()?.useremail,
        userphone: this.user()?.userphone,
        userspecialty: this.user()?.userspecialty ?? '',
      });
    } else {
      this.userForm.reset({ userstatus: 'active' });
      this.loadBranches();
    }
  }

  private loadBranches(): void {
    this.loadingBranches.set(true);
    this.branchService.getBranches().subscribe({
      next: (res) => { this.branches.set(res); this.loadingBranches.set(false); },
      error: () => { this.loadingBranches.set(false); },
    });
  }

  get firstnameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('userfirstname');
    if (ctrl?.errors?.['required']) return 'El nombre es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 2 caracteres';
    return '';
  }

  get lastnameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('userlastname');
    if (ctrl?.errors?.['required']) return 'El apellido es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 2 caracteres';
    return '';
  }

  get usernameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('username');
    if (ctrl?.errors?.['required']) return 'El usuario es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 3 caracteres';
    return '';
  }

  get emailError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('useremail');
    if (ctrl?.errors?.['required']) return 'El correo es requerido';
    if (ctrl?.errors?.['email']) return 'Correo inválido';
    return '';
  }

  get passwordError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('userpassword');
    if (ctrl?.errors?.['required']) return 'La contraseña es requerida';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 8 caracteres';
    return '';
  }

  get branchError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('branchuuid');
    if (ctrl?.errors?.['required']) return 'Selecciona una sucursal';
    return '';
  }

  get specialtyError(): string {
    if (!this.sent()) return '';
    const ctrl = this.userForm.get('userspecialty');
    if (ctrl?.errors?.['maxlength']) return 'Máximo 100 caracteres';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    this.loading.set(true);
    if (this.userForm.valid) {
      if (!this.isEdit()) {
        const dto: CreateUserInterface = {
          userfirstname: this.userForm.value.userfirstname,
          userlastname: this.userForm.value.userlastname,
          username: this.userForm.value.username,
          useremail: this.userForm.value.useremail,
          userphone: this.userForm.value.userphone,
          branchuuid: this.userForm.value.branchuuid,
          userstatus: this.userForm.value.userstatus,
          userspecialty: this.userForm.value.userspecialty || undefined,
        };
        this.userService.create(dto).subscribe({
          next: (response: UsersInterface) => {
            this.responseUser.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          },
        });
      } else if (this.isEdit() && this.useruuid() !== '') {
        const dto: UpdateUserInterface = {
          userfirstname: this.userForm.value.userfirstname,
          userlastname: this.userForm.value.userlastname,
          useremail: this.userForm.value.useremail,
          userphone: this.userForm.value.userphone,
          userspecialty: this.userForm.value.userspecialty || undefined,
        };
        this.userService.update(this.useruuid(), dto).subscribe({
          next: (response: UsersInterface) => {
            this.responseUser.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body.error, body.message);
            this.loading.set(false);
          },
        });
      }
    } else {
      this.loading.set(false);
    }
  }

  handleError(error: string, message?: string) {
    switch (error) {
      case 'AE_EMAIL_CONFLICT':
        this.error.set('El correo electrónico ya está en uso.');
        break;
      case 'AE_USERNAME_CONFLICT':
        this.error.set('El nombre de usuario ya está en uso.');
        break;
      default:
        this.error.set(message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
    }
  }

}
