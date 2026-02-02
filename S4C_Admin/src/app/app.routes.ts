import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    { path: '', redirectTo: 'admin', pathMatch: 'full' } // Redirect to admin for now
];
