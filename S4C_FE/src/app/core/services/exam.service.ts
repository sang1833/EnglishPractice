import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    PagedList,
    ExamListDto,
    ExamDto,
    Exam,
    ExamStatus,
    ExamType,
    ExamSkillListDto,
    ExamSkillDto
} from '../models';

export interface ExamListParams {
    page?: number;
    pageSize?: number;
    status?: ExamStatus;
    type?: ExamType;
    search?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExamService {
    private readonly api = inject(ApiService);

    /**
     * Get paginated list of exams
     */
    getExams(params?: ExamListParams): Observable<PagedList<ExamListDto>> {
        return this.api.get<PagedList<ExamListDto>>('/Exams', {
            params: {
                page: params?.page,
                pageSize: params?.pageSize,
                status: params?.status,
                type: params?.type,
                search: params?.search
            }
        });
    }

    /**
     * Get exam by ID
     */
    getExamById(id: string): Observable<ExamDto> {
        return this.api.get<ExamDto>(`/Exams/${id}`);
    }

    /**
     * Get exam by URL slug
     */
    getExamBySlug(slug: string): Observable<ExamDto> {
        return this.api.get<ExamDto>(`/Exams/by-slug/${slug}`);
    }

    /**
     * Get full exam with all nested data (for test taking)
     */
    getFullExam(id: string): Observable<Exam> {
        return this.api.get<Exam>(`/Exams/${id}/full`);
    }

    /**
     * Get skills for an exam
     */
    getExamSkills(examId: string): Observable<ExamSkillListDto[]> {
        return this.api.get<ExamSkillListDto[]>(`/Skills/exam/${examId}`);
    }

    /**
     * Get skill detail with sections
     */
    getSkillById(skillId: string): Observable<ExamSkillDto> {
        return this.api.get<ExamSkillDto>(`/Skills/${skillId}`);
    }
}
