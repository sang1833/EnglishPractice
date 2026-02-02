import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unexpected error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
            } else {
                // Server-side error
                switch (error.status) {
                    case 400:
                        errorMessage = error.error?.message || 'Bad request';
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to access this resource';
                        break;
                    case 404:
                        errorMessage = 'Resource not found';
                        break;
                    case 500:
                        errorMessage = 'Internal server error';
                        break;
                    default:
                        errorMessage = `Error: ${error.status} - ${error.statusText}`;
                }
            }

            // Log error for debugging (can be replaced with a logging service)
            console.error('HTTP Error:', {
                url: req.url,
                status: error.status,
                message: errorMessage
            });

            return throwError(() => ({
                status: error.status,
                message: errorMessage,
                originalError: error
            }));
        })
    );
};
