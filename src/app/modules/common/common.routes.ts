import { Routes } from '@angular/router';

export const commonRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.Home),
    canActivate: [],
    data: {
      title: 'Panel de Control'
    }
  },

  {
    path: 'business',
    loadComponent: () => import('./business/business').then(m => m.Business),
    canActivate: [],
    data: {
      title: 'Configuración de negocio'
    }
  },
  {
    path: 'business/:type',
    loadComponent: () => import('./business/details/details').then(m => m.Details),
    canActivate: [],
    data: {
      title: 'Detalles de negocio'
    }
  },


  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
