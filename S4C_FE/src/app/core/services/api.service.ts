import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequestOptions {
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    /**
     * Perform a GET request
     */
    get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.http.get<T>(
            `${this.baseUrl}${endpoint}`,
            this.buildHttpOptions(options)
        );
    }

    /**
     * Perform a POST request
     */
    post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
        return this.http.post<T>(
            `${this.baseUrl}${endpoint}`,
            body,
            this.buildHttpOptions(options)
        );
    }

    /**
     * Perform a PUT request
     */
    put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
        return this.http.put<T>(
            `${this.baseUrl}${endpoint}`,
            body,
            this.buildHttpOptions(options)
        );
    }

    /**
     * Perform a DELETE request
     */
    delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.http.delete<T>(
            `${this.baseUrl}${endpoint}`,
            this.buildHttpOptions(options)
        );
    }

    /**
     * Build HTTP options from RequestOptions
     */
    private buildHttpOptions(options?: RequestOptions): { params?: HttpParams; headers?: HttpHeaders } {
        const result: { params?: HttpParams; headers?: HttpHeaders } = {};

        if (options?.params) {
            let params = new HttpParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params = params.set(key, String(value));
                }
            });
            result.params = params;
        }

        if (options?.headers) {
            let headers = new HttpHeaders();
            Object.entries(options.headers).forEach(([key, value]) => {
                headers = headers.set(key, value);
            });
            result.headers = headers;
        }

        return result;
    }
}
