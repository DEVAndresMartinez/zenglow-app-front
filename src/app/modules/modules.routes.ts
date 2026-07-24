import { Routes } from '@angular/router';
import { MainLayout } from '../layouts/main-layout/main-layout';
import { authGuard } from '../core/guards/auth.guard';

export const modulesRoutes: Routes = [

  {
    path: 'common',
    component: MainLayout,
    canActivate: [authGuard],
    loadChildren: () => import('./common/common.routes').then(m => m.commonRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
  }

];
