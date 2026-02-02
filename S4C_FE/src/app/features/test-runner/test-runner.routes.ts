import { Routes } from '@angular/router';

export const testRunnerRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./test-runner.component').then((m) => m.TestRunnerComponent),
        title: 'Taking Test - Study4Clone'
    }
];
