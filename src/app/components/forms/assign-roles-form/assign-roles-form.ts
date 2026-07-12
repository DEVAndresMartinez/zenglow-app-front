import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UserService } from '../../../core/services/modules/user.service';
import { RoleServices } from '../../../core/services/modules/role.services';
import { RolesInterface } from '../../../core/interfaces/role.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

@Component({
  selector: 'app-assign-roles-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent],
  templateUrl: './assign-roles-form.html',
})
export class AssignRolesForm implements OnInit {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  saved = output<UsersInterface>();
  closed = output();

  responseUser = signal<UsersInterface | null>(null);
  error = signal('');
  sent = signal(false);
  loading = signal(false);

  roles = signal<RolesInterface[]>([]);
  loadingRoles = signal(true);

  roleOptions = computed<DropdownOption[]>(() =>
    this.roles().map(r => ({ abv: r.roleuuid, name: r.rolename }))
  );

  form: FormGroup = new FormGroup({
    roleuuids: new FormControl<string[]>([], { validators: [Validators.required], nonNullable: true }),
  });

  private userService = inject(UserService);
  private roleServices = inject(RoleServices);

  ngOnInit(): void {
    this.loadingRoles.set(true);
    this.roleServices.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res);
        this.loadingRoles.set(false);
        this.form.patchValue({ roleuuids: (this.user()?.roles ?? []).map(r => r.roleuuid) });
      },
      error: () => { this.loadingRoles.set(false); },
    });
  }

  get rolesError(): string {
    if (!this.sent()) return '';
    const ctrl = this.form.get('roleuuids');
    if (ctrl?.errors?.['required']) return 'Selecciona al menos un rol';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const roleuuids: string[] = this.form.value.roleuuids ?? [];

    this.userService.assignRoles(this.useruuid(), { roleuuids }).subscribe({
      next: (response: UsersInterface) => {
        this.responseUser.set(response);
        this.loading.set(false);
        this.saved.emit(response);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.error.set(body?.message || 'No se pudieron actualizar los roles. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

}
