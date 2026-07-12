import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Tabs, TabItem } from '../../../../components/shared/ui/tabs/tabs';
import { BranchService } from '../../../../core/services/modules/branch.service';
import { BranchesInterface } from '../../../../core/interfaces/branch.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UISearchComponent } from "../../../../components/shared/ui/ui-search-component/ui-search-component";
import { UsersInterface } from '../../../../core/interfaces/user.interface';
import { UserService } from '../../../../core/services/modules/user.service';
import { RolesInterface } from '../../../../core/interfaces/role.interface';
import { RoleServices } from '../../../../core/services/modules/role.services';
import { CommonModule } from '@angular/common';
import { BranchForm } from '../../../../components/forms/branch-form/branch-form';
import { UserForm } from '../../../../components/forms/user-form/user-form';
import { ChangePasswordForm } from '../../../../components/forms/change-password-form/change-password-form';
import { UIConfirmModalComponent } from '../../../../components/shared/ui/ui-confirm-modal/ui-confirm-modal';
import { ActionMenuItem, UIActionMenuComponent } from '../../../../components/shared/ui/ui-action-menu/ui-action-menu';
import { AssignBranchForm } from '../../../../components/forms/assign-branch-form/assign-branch-form';
import { AssignRolesForm } from '../../../../components/forms/assign-roles-form/assign-roles-form';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorGlobalException } from '../../../../core/exceptions/error.interface';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activa', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactiva', classes: 'bg-stroke/40 text-muted border-stroke' },
  maintenance: { label: 'Mantenimiento', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  deleted: { label: 'Eliminada', classes: 'bg-error/10 text-error border-error/30' },
};

const USER_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activo', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactivo', classes: 'bg-stroke/40 text-muted border-stroke' },
  maintenance: { label: 'Mantenimiento', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  deleted: { label: 'Eliminado', classes: 'bg-error/10 text-error border-error/30' },
};

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterLink, Tabs, FontAwesomeModule, UISearchComponent, BranchForm, UserForm, ChangePasswordForm, UIConfirmModalComponent, UIActionMenuComponent, AssignBranchForm, AssignRolesForm],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class Details {

  private branchService = inject(BranchService);
  private userService = inject(UserService);
  private roleServices = inject(RoleServices);
  private route = inject(ActivatedRoute);

  branches = signal<BranchesInterface[]>([]);
  branchesCopy = signal<BranchesInterface[]>([]);

  users = signal<UsersInterface[]>([]);
  usersCopy = signal<UsersInterface[]>([]);

  roles = signal<RolesInterface[]>([]);
  rolesCopy = signal<RolesInterface[]>([]);

  loading = signal(false);
  showBranchForm = signal(false);
  editBranch = signal<BranchesInterface | null>(null);

  showUserForm = signal(false);
  editUser = signal<UsersInterface | null>(null);

  showChangePasswordForm = signal(false);
  changePasswordUser = signal<UsersInterface | null>(null);

  showDeleteBranchForm = signal(false);
  deleteBranch = signal<BranchesInterface | null>(null);
  deletingBranch = signal(false);
  deleteBranchError = signal('');

  showDeleteUserForm = signal(false);
  deleteUser = signal<UsersInterface | null>(null);
  deletingUser = signal(false);
  deleteUserError = signal('');

  showAssignBranchForm = signal(false);
  assignBranchUser = signal<UsersInterface | null>(null);

  showAssignRolesForm = signal(false);
  assignRolesUser = signal<UsersInterface | null>(null);

  type = toSignal(
    this.route.paramMap.pipe(map(p => p.get('type') ?? '')),
    { initialValue: '' }
  );

  userActionItems: ActionMenuItem[] = [
    { key: 'edit', label: 'Editar', icon: 'pen' },
    { key: 'password', label: 'Cambiar contraseña', icon: 'key' },
    { key: 'branch', label: 'Cambiar sucursal', icon: 'store' },
    { key: 'role', label: 'Cambiar rol', icon: 'user-tag' },
    { key: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
  ];

  tabs: TabItem[] = [
    { label: 'Sucursales', icon: ['fas', 'store'], link: '/modules/common/business/branches' },
    { label: 'Usuarios', icon: ['fas', 'users'], link: '/modules/common/business/users' },
    { label: 'Roles', icon: ['fas', 'user-tag'], link: '/modules/common/business/roles' },
  ];

  constructor() {
    effect(() => {
      if (this.type() === 'branches' && this.branchesCopy().length === 0) {
        this.getBranches();
      } else if (this.type() === 'users' && this.usersCopy().length === 0) {
        this.getUsers();
      } else if (this.type() === 'roles' && this.rolesCopy().length === 0) {
        this.getRoles();
      }
    });
  }

  openCreateBranch() {
    this.editBranch.set(null);
    this.showBranchForm.set(true);
  }

  openEditBranch(branch: BranchesInterface) {
    this.editBranch.set(branch);
    this.showBranchForm.set(true);
  }

  onBranchSaved(branch: BranchesInterface) {
    if (this.editBranch() !== null) {
      this.branches.update(bs => bs.map(b => b.branchuuid === branch.branchuuid ? branch : b));
      this.branchesCopy.update(bs => bs.map(b => b.branchuuid === branch.branchuuid ? branch : b));
    } else {
      this.branches.update(bs => [branch, ...bs]);
      this.branchesCopy.update(bs => [branch, ...bs]);
    }
  }

  onFormClosed() {
    this.showBranchForm.set(false);
    this.editBranch.set(null);
  }

  openCreateUser() {
    this.editUser.set(null);
    this.showUserForm.set(true);
  }

  openEditUser(user: UsersInterface) {
    this.editUser.set(user);
    this.showUserForm.set(true);
  }

  onUserSaved(user: UsersInterface) {
    if (this.editUser() !== null) {
      this.users.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
      this.usersCopy.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
    } else {
      this.users.update(us => [user, ...us]);
      this.usersCopy.update(us => [user, ...us]);
    }
  }

  onUserFormClosed() {
    this.showUserForm.set(false);
    this.editUser.set(null);
  }

  openChangePassword(user: UsersInterface) {
    this.changePasswordUser.set(user);
    this.showChangePasswordForm.set(true);
  }

  onChangePasswordFormClosed() {
    this.showChangePasswordForm.set(false);
    this.changePasswordUser.set(null);
  }

  onUserAction(action: string, user: UsersInterface) {
    switch (action) {
      case 'edit': this.openEditUser(user); break;
      case 'password': this.openChangePassword(user); break;
      case 'branch': this.openAssignBranch(user); break;
      case 'role': this.openAssignRoles(user); break;
      case 'delete': this.openDeleteUser(user); break;
    }
  }

  openAssignBranch(user: UsersInterface) {
    this.assignBranchUser.set(user);
    this.showAssignBranchForm.set(true);
  }

  onAssignBranchSaved(user: UsersInterface) {
    this.users.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
    this.usersCopy.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
  }

  onAssignBranchFormClosed() {
    this.showAssignBranchForm.set(false);
    this.assignBranchUser.set(null);
  }

  openAssignRoles(user: UsersInterface) {
    this.assignRolesUser.set(user);
    this.showAssignRolesForm.set(true);
  }

  onAssignRolesSaved(user: UsersInterface) {
    this.users.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
    this.usersCopy.update(us => us.map(u => u.useruuid === user.useruuid ? user : u));
  }

  onAssignRolesFormClosed() {
    this.showAssignRolesForm.set(false);
    this.assignRolesUser.set(null);
  }

  onGlobalFilter(value: any) {
    if (this.type() === 'branches') {
      this.branchesCopy.set(this.branches().filter(branch => branch.branchname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || branch.branchaddress.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || branch.branchphone.toLocaleLowerCase().includes(value.toLocaleLowerCase())))
    } else if (this.type() === 'users') {
      this.usersCopy.set(this.users().filter(user => user.userfirstname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.userlastname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.useremail.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.username.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.userphone.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.branch.branchname.toLocaleLowerCase().includes(value.toLocaleLowerCase())));
    } else if (this.type() === 'roles') {
      this.rolesCopy.set(this.roles().filter(role => role.rolename.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || role.roledesc.toLocaleLowerCase().includes(value.toLocaleLowerCase())));
    }
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['inactive'];
  }

  userStatusConfig(status: string) {
    return USER_STATUS_MAP[status] ?? USER_STATUS_MAP['inactive'];
  }

  getBranches() {
    this.loading.set(true);
    this.branchService.getBranches().subscribe({
      next: (response) => {
        this.branches.set(response);
        this.branchesCopy.set(this.branches());
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  getUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response);
        this.usersCopy.set(this.users());
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  getRoles() {
    this.loading.set(true);
    this.roleServices.getRoles().subscribe({
      next: (response) => {
        this.roles.set(response);
        this.rolesCopy.set(this.roles());
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  openDeleteBranch(branch: BranchesInterface) {
    this.deleteBranch.set(branch);
    this.deleteBranchError.set('');
    this.showDeleteBranchForm.set(true);
  }

  onDeleteBranchCancelled() {
    this.showDeleteBranchForm.set(false);
    this.deleteBranch.set(null);
  }

  onDeleteBranchConfirmed() {
    const branch = this.deleteBranch();
    if (!branch) return;
    this.deletingBranch.set(true);
    this.deleteBranchError.set('');
    this.branchService.remove(branch.branchuuid).subscribe({
      next: () => {
        this.branches.update(bs => bs.filter(b => b.branchuuid !== branch.branchuuid));
        this.branchesCopy.update(bs => bs.filter(b => b.branchuuid !== branch.branchuuid));
        this.deletingBranch.set(false);
        this.showDeleteBranchForm.set(false);
        this.deleteBranch.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.deleteBranchError.set(body?.message || 'No se pudo eliminar la sucursal. Inténtalo nuevamente.');
        this.deletingBranch.set(false);
      },
    });
  }

  openDeleteUser(user: UsersInterface) {
    this.deleteUser.set(user);
    this.deleteUserError.set('');
    this.showDeleteUserForm.set(true);
  }

  onDeleteUserCancelled() {
    this.showDeleteUserForm.set(false);
    this.deleteUser.set(null);
  }

  onDeleteUserConfirmed() {
    const user = this.deleteUser();
    if (!user) return;
    this.deletingUser.set(true);
    this.deleteUserError.set('');
    this.userService.remove(user.useruuid).subscribe({
      next: () => {
        this.users.update(us => us.filter(u => u.useruuid !== user.useruuid));
        this.usersCopy.update(us => us.filter(u => u.useruuid !== user.useruuid));
        this.deletingUser.set(false);
        this.showDeleteUserForm.set(false);
        this.deleteUser.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.deleteUserError.set(body?.message || 'No se pudo eliminar el usuario. Inténtalo nuevamente.');
        this.deletingUser.set(false);
      },
    });
  }

}
