import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register),
    canActivate: [],
    data: {
      title: 'Registra tu comercio'
    }
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
    canActivate: [],
    data: {
      title: 'Zenglow'
    }
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword),
    canActivate: [],
    data: {
      title: 'Recuperar contraseña'
    }
  },


  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
