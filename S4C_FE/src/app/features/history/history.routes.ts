import { Routes } from '@angular/router';

export const historyRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./user-history.component').then((m) => m.UserHistoryComponent),
        title: 'My Tests - Study4Clone'
    }
];
