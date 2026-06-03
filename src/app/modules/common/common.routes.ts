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



    
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }
];
