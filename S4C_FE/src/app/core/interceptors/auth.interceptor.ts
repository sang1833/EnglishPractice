import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

const TOKEN_KEY = 's4c_auth_token';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const router = inject(Router);
    const token = localStorage.getItem(TOKEN_KEY);

    // Clone request with auth header if token exists
    const authReq = token
        ? req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })
        : req;

    return next(authReq).pipe(
        catchError((error) => {
            // Handle 401 Unauthorized - redirect to login
            if (error.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        })
    );
};
