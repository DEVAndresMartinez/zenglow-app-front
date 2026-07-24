import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { DropdownOption, UIDropdownComponent } from '../../shared/ui/ui-dropdown-component/ui-dropdown-component';
import { UserService } from '../../../core/services/modules/user.service';
import { BranchService } from '../../../core/services/modules/branch.service';
import { BranchesInterface } from '../../../core/interfaces/branch.interface';
import { UsersInterface } from '../../../core/interfaces/user.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

@Component({
  selector: 'app-assign-branch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIDropdownComponent],
  templateUrl: './assign-branch-form.html',
})
export class AssignBranchForm implements OnInit {

  useruuid = input<string>('');
  user = input<UsersInterface | null>(null);

  saved = output<UsersInterface>();
  closed = output();

  responseUser = signal<UsersInterface | null>(null);
  error = signal('');
  sent = signal(false);
  loading = signal(false);

  branches = signal<BranchesInterface[]>([]);
  loadingBranches = signal(true);

  branchOptions = computed<DropdownOption[]>(() =>
    this.branches().map(b => ({ abv: b.branchuuid, name: b.branchname }))
  );

  form: FormGroup = new FormGroup({
    branchuuid: new FormControl<string>('', { validators: [Validators.required] }),
  });

  private userService = inject(UserService);
  private branchService = inject(BranchService);

  ngOnInit(): void {
    this.loadingBranches.set(true);
    this.branchService.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res);
        this.loadingBranches.set(false);
        this.form.patchValue({ branchuuid: this.user()?.branch?.branchuuid ?? '' });
      },
      error: () => { this.loadingBranches.set(false); },
    });
  }

  get branchError(): string {
    if (!this.sent()) return '';
    const ctrl = this.form.get('branchuuid');
    if (ctrl?.errors?.['required']) return 'Selecciona una sucursal';
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

    const branchuuid = this.form.value.branchuuid;

    this.userService.assignBranch(this.useruuid(), { branchuuid }).subscribe({
      next: (response: UsersInterface) => {
        this.responseUser.set(response);
        this.loading.set(false);
        this.saved.emit(response);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.error.set(body?.message || 'No se pudo cambiar la sucursal. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

}
