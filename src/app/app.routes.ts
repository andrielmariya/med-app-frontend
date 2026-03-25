import { Routes } from '@angular/router';
import { LoginComponent } from './features/pages/login/login.component';
import { RegisterComponent } from './features/pages/register/register.component';
import { DashboardComponent } from './features/pages/dashboard/dashboard.component';
import { HistoryComponent } from './features/pages/history/history.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [() => {
            const token = localStorage.getItem('token');
            if (token) return true;
            const router = inject(Router);
            return router.createUrlTree(['/login']);
        }]
    },
    {
        path: 'history',
        component: HistoryComponent,
        canActivate: [() => {
            const token = localStorage.getItem('token');
            if (token) return true;
            const router = inject(Router);
            return router.createUrlTree(['/login']);
        }]
    },
    {
        path: 'admin/users',
        loadComponent: () => import('./features/pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [() => {
            const isSuper = localStorage.getItem('is_superuser') === 'true';
            if (isSuper) return true;
            const router = inject(Router);
            return router.createUrlTree(['/dashboard']);
        }]
    },
    {
        path: 'statistics',
        loadComponent: () => import('./features/pages/statistics/statistics.component').then(m => m.StatisticsComponent),
        canActivate: [() => {
            const token = localStorage.getItem('token');
            if (token) return true;
            const router = inject(Router);
            return router.createUrlTree(['/login']);
        }]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./features/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }
];
