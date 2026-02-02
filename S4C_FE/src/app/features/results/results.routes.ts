import { Routes } from '@angular/router';

export const resultsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./test-result.component').then((m) => m.TestResultComponent),
        title: 'Test Result - Study4Clone'
    }
];
