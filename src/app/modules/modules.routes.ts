import { Routes } from '@angular/router';
import { MainLayout } from '../layouts/main-layout/main-layout';

export const modulesRoutes: Routes = [

    {  
        path: 'common',
        component: MainLayout,
        canActivate: [],
        loadChildren: () => import('./common/common.routes').then(m => m.commonRoutes)
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
    }

    

];
