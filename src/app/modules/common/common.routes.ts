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
  {
    path: 'customers',
    loadComponent: () => import('./customers/customers').then(m => m.Customers),
    canActivate: [],
    data: {
      title: 'Gestión de Clientes'
    }
  },
  {
    path: 'services',
    loadComponent: () => import('./services/services').then(m => m.Services),
    canActivate: [],
    data: {
      title: 'Gestión de Servicios'
    }
  },
  {
    path: 'sales',
    loadComponent: () => import('./sales/sales').then(m => m.Sales),
    canActivate: [],
    data: {
      title: 'Gestión de Ventas'
    }
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then(m => m.Settings),
    canActivate: [],
    data: {
      title: 'Configuraciones'
    }
  },


  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
