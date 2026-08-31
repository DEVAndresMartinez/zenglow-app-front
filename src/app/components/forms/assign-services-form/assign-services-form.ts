import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UserService } from '../../../core/services/modules/user.service';
import { ServiceService } from '../../../core/services/modules/service.service';
import { ServiceInterface } from '../../../core/interfaces/service.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

/**
 * Sincroniza qué servicios ofrece un profesional (tabla puente user_services
 * en el backend). Determina, entre otras cosas, qué muestra la landing
 * pública al filtrar profesionales/servicios por selección.
 */
@Component({
  selector: 'app-assign-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent],
  templateUrl: './assign-services-form.html',
})
export class AssignServicesForm implements OnInit {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  saved = output<UsersInterface>();
  closed = output();

  responseUser = signal<UsersInterface | null>(null);
  error = signal('');
  sent = signal(false);
  loading = signal(false);

  services = signal<ServiceInterface[]>([]);
  loadingServices = signal(true);

  serviceOptions = computed<DropdownOption[]>(() =>
    this.services()
      .filter(s => s.servicestatus === 'active')
      .map(s => ({ abv: s.serviceuuid, name: s.servicename }))
  );

  // A diferencia de los roles, un profesional puede quedar sin servicios explícitamente
  // vinculados (la landing pública lo trata como "ofrece todo el catálogo" en ese caso), así
  // que aquí una selección vacía es válida y se puede guardar.
  form: FormGroup = new FormGroup({
    serviceuuids: new FormControl<string[]>([], { nonNullable: true }),
  });

  private userService = inject(UserService);
  private serviceService = inject(ServiceService);

  ngOnInit(): void {
    this.loadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (res) => {
        this.services.set(res);
        this.loadingServices.set(false);
        this.form.patchValue({ serviceuuids: (this.user()?.services ?? []).map(s => s.serviceuuid) });
      },
      error: () => { this.loadingServices.set(false); },
    });
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const serviceuuids: string[] = this.form.value.serviceuuids ?? [];

    this.userService.assignServices(this.useruuid(), { serviceuuids }).subscribe({
      next: (response: UsersInterface) => {
        this.responseUser.set(response);
        this.loading.set(false);
        this.saved.emit(response);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.error.set(body?.message || 'No se pudieron actualizar los servicios. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

}
