import { Routes } from '@angular/router';

export const examDetailRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./exam-detail.component').then((m) => m.ExamDetailComponent),
        title: 'Exam Details - Study4Clone'
    }
];
