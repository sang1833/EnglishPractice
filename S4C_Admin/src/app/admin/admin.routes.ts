import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

import { authGuard } from '../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'exams', loadComponent: () => import('./features/exam-list/exam-list.component').then(m => m.ExamListComponent) },
            { path: 'exams/:id', loadComponent: () => import('./features/exam-detail/exam-detail.component').then(m => m.ExamDetailComponent) },
            { path: 'import', loadComponent: () => import('./features/exam-import/exam-import.component').then(m => m.ExamImportComponent) },
            { path: 'create', loadComponent: () => import('./features/exam-wizard/exam-wizard.component').then(m => m.ExamWizardComponent) },
        ]
    }
];
