import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5041/api';

@Injectable({
    providedIn: 'root'
})
export class QuestionGroupsService {
    constructor(private http: HttpClient) { }

    createGroup(sectionId: string, data: any): Observable<any> {
        // Assuming backend added this endpoint as per request
        return this.http.post<any>(`${API_URL}/admin/question-groups`, { ...data, sectionId });
    }

    createBulkQuestions(groupId: string, questions: any[]): Observable<any> {
        return this.http.post<any>(`${API_URL}/Questions/group/${groupId}/bulk`, questions);
    }
}
