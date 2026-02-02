import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards';
import { AuthLayoutComponent } from '../../shared/layouts/auth-layout/auth-layout.component';

export const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [guestGuard],
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./login/login.component').then((m) => m.LoginComponent),
                title: 'Login - Study4Clone'
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./login/register.component').then((m) => m.RegisterComponent),
                title: 'Register - Study4Clone'
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    }
];
