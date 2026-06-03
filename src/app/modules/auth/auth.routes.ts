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

    
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
