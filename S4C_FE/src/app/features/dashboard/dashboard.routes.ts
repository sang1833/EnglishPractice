import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./exam-list/exam-list.component').then((m) => m.ExamListComponent),
        title: 'Dashboard - Study4Clone'
    }
];
