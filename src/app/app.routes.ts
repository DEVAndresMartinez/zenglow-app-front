import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/modules/common/home', pathMatch: 'full' },
  { path: 'modules', loadChildren: () => import('./modules/modules.routes').then(m => m.modulesRoutes) },


  { path: 'landing-page', loadComponent: () => import('./app-landing/landing/landing').then(m => m.Landing) },
  { path: 'landing-page/:slug', loadComponent: () => import('./app-landing/landing/landing').then(m => m.Landing) },
];
