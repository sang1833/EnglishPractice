import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

export const routes: Routes = [
    // Public routes - Auth
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.routes').then((m) => m.authRoutes)
    },

    // Protected routes - with main layout
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes)
            },
            {
                path: 'exam/:slug',
                loadChildren: () =>
                    import('./features/exam-detail/exam-detail.routes').then((m) => m.examDetailRoutes)
            },
            {
                path: 'test/:id',
                loadChildren: () =>
                    import('./features/test-runner/test-runner.routes').then((m) => m.testRunnerRoutes)
            },
            {
                path: 'result/:id',
                loadChildren: () =>
                    import('./features/results/results.routes').then((m) => m.resultsRoutes)
            },
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile.component').then((m) => m.ProfileComponent)
            },
            {
                path: 'statistics',
                loadComponent: () =>
                    import('./features/statistics/statistic.component').then((m) => m.StatisticComponent)
            },
            {
                path: 'history',
                loadChildren: () =>
                    import('./features/history/history.routes').then((m) => m.historyRoutes)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },

    // Catch-all redirect
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
