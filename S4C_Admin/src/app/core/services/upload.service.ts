import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5041/api';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        // Assuming /api/upload endpoint exists
        return this.http.post<{ url: string }>(`${API_URL}/upload`, formData);
    }
}
