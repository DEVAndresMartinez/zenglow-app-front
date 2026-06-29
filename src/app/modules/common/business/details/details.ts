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
import { CommonModule } from '@angular/common';
import { BranchForm } from '../../../../components/forms/branch-form/branch-form';

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
  imports: [CommonModule, RouterLink, Tabs, FontAwesomeModule, UISearchComponent, BranchForm],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class Details {

  private branchService = inject(BranchService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  branches = signal<BranchesInterface[]>([]);
  branchesCopy = signal<BranchesInterface[]>([]);

  users = signal<UsersInterface[]>([]);
  usersCopy = signal<UsersInterface[]>([]);

  loading = signal(false);
  showBranchForm = signal(false);
  editBranch = signal<BranchesInterface | null>(null);

  type = toSignal(
    this.route.paramMap.pipe(map(p => p.get('type') ?? '')),
    { initialValue: '' }
  );

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

  onGlobalFilter(value: any) {
    if (this.type() === 'branches') {
      this.branchesCopy.set(this.branches().filter(branch => branch.branchname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || branch.branchaddress.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || branch.branchphone.toLocaleLowerCase().includes(value.toLocaleLowerCase())))
    } else if (this.type() === 'users') {
      this.usersCopy.set(this.users().filter(user => user.userfirstname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.userlastname.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.useremail.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.username.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.userphone.toLocaleLowerCase().includes(value.toLocaleLowerCase()) || user.branch.branchname.toLocaleLowerCase().includes(value.toLocaleLowerCase())));
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

}
