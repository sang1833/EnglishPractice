import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateExamRequest, ExamDto, ExamListDto, PagedList, LoginResponse, ExamSkill, ExamSection, Exam } from '../models/api.models';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class ExamsService {
    constructor(private http: HttpClient) { }

    // Exams
    getExams(params: any): Observable<PagedList<ExamListDto>> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.set(key, params[key]);
            }
        });
        return this.http.get<PagedList<ExamListDto>>(`${API_URL}/Exams`, { params: httpParams });
    }

    getExam(id: string): Observable<ExamDto> {
        return this.http.get<ExamDto>(`${API_URL}/Exams/${id}`);
    }

    getFullExam(id: string): Observable<Exam> {
        return this.http.get<Exam>(`${API_URL}/Exams/${id}/full`);
    }

    createExam(data: CreateExamRequest): Observable<ExamDto> {
        return this.http.post<ExamDto>(`${API_URL}/Exams`, data);
    }

    importExam(data: any): Observable<any> {
        // Using 'any' for import DTO for now as it's complex, or use the ExamImportDto if I generated it.
        // Let's stick to any for Import for this step to minimize friction, or Update if I have strictly typed it.
        // Swagger said ExamImportDto.
        return this.http.post<any>(`${API_URL}/admin/exams/import`, data);
    }

    deleteExam(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/Exams/${id}`);
    }

    // Skills
    createSkill(examId: string, data: any): Observable<ExamSkill> {
        return this.http.post<ExamSkill>(`${API_URL}/Skills/exam/${examId}`, data);
    }

    // Sections
    createSection(skillId: string, data: any): Observable<ExamSection> {
        return this.http.post<ExamSection>(`${API_URL}/Sections/skill/${skillId}`, data);
    }
}
