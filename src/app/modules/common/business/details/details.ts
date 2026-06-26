import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Tabs, TabItem } from '../../../../components/shared/ui/tabs/tabs';
import { BranchService } from '../../../../core/services/modules/branch.service';
import { BranchesInterface } from '../../../../core/interfaces/branch.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active:      { label: 'Activa',        classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive:    { label: 'Inactiva',      classes: 'bg-stroke/40 text-muted border-stroke' },
  maintenance: { label: 'Mantenimiento', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  deleted:     { label: 'Eliminada',     classes: 'bg-error/10 text-error border-error/30' },
};

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [Tabs, FontAwesomeModule],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class Details {

  private branchService = inject(BranchService);
  private route = inject(ActivatedRoute);

  branches = signal<BranchesInterface[]>([]);
  loading  = signal(false);

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
      if (this.type() === 'branches' && this.branches().length === 0) {
        this.getBranches();
      }
    });
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['inactive'];
  }

  getBranches() {
    this.loading.set(true);
    this.branchService.getBranches().subscribe({
      next:  (response) => { this.branches.set(response); this.loading.set(false); },
      error: ()         => { this.loading.set(false); },
    });
  }

}
