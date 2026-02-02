import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import {
    PagedList,
    TestAttemptDto,
    TestAttemptListDto,
    StartTestRequest,
    SubmitTestRequest,
    SubmitAnswerRequest,
    TestResultDto
} from '../models';

const ANSWERS_STORAGE_KEY = 's4c_draft_answers';

@Injectable({
    providedIn: 'root'
})
export class TestAttemptService {
    private readonly api = inject(ApiService);

    // Current active attempt signal
    private currentAttemptSignal = signal<TestAttemptDto | null>(null);
    readonly currentAttempt = this.currentAttemptSignal.asReadonly();

    // Draft answers for auto-save
    private draftAnswersSignal = signal<Map<string, SubmitAnswerRequest>>(new Map());
    readonly draftAnswers = this.draftAnswersSignal.asReadonly();

    constructor() {
        // Load draft answers from localStorage on init
        this.loadDraftAnswers();
    }

    /**
     * Get user's test attempt history
     */
    getUserAttempts(
        userId: string,
        page = 1,
        pageSize = 10,
        fromDate?: Date,
        toDate?: Date,
        sortOrder?: string
    ): Observable<PagedList<TestAttemptListDto>> {
        const params: any = { page, pageSize };
        if (fromDate) params.fromDate = fromDate.toISOString();
        if (toDate) params.toDate = toDate.toISOString();
        if (sortOrder) params.sortOrder = sortOrder;

        return this.api.get<PagedList<TestAttemptListDto>>(`/TestAttempts/user/${userId}`, { params });
    }

    /**
     * Get attempt by ID
     */
    getAttemptById(id: string): Observable<TestAttemptDto> {
        return this.api.get<TestAttemptDto>(`/TestAttempts/${id}`).pipe(
            tap((attempt) => this.currentAttemptSignal.set(attempt))
        );
    }

    /**
     * Get detailed result for a completed attempt
     */
    getAttemptResult(attemptId: string): Observable<TestResultDto> {
        return this.api.get<TestResultDto>(`/TestAttempts/${attemptId}/result`);
    }

    /**
     * Start a new test attempt
     */
    startTest(request: StartTestRequest, userId?: string): Observable<TestAttemptDto> {
        return this.api.post<TestAttemptDto>('/TestAttempts/start', request, {
            params: userId ? { userId } : undefined
        }).pipe(
            tap((attempt) => {
                this.currentAttemptSignal.set(attempt);
                this.clearDraftAnswers(); // Clear any previous drafts
            })
        );
    }

    /**
     * Get exam content for a specific attempt (filtered by selected skills)
     */
    getAttemptExam(attemptId: string): Observable<any> { // Using any or Exam type, assuming circular dependency is handled or type is available
        // Note: The return type is Exam but importing it might cause circular dependency if models import service (unlikely) or if we want to be strict.
        return this.api.get<any>(`/TestAttempts/${attemptId}/exam`);
    }

    /**
     * Submit all answers and complete the test
     */
    submitTest(attemptId: string, answers: SubmitAnswerRequest[]): Observable<TestResultDto> {
        const request: SubmitTestRequest = { answers };
        return this.api.post<TestResultDto>(`/TestAttempts/${attemptId}/submit`, request).pipe(
            tap(() => {
                this.currentAttemptSignal.set(null);
                this.clearDraftAnswers();
            })
        );
    }

    /**
     * Abandon a test attempt
     */
    abandonTest(attemptId: string): Observable<void> {
        return this.api.post<void>(`/TestAttempts/${attemptId}/abandon`, {}).pipe(
            tap(() => {
                this.currentAttemptSignal.set(null);
                this.clearDraftAnswers();
            })
        );
    }

    /**
     * Pause a test attempt and save draft
     */
    pauseTest(attemptId: string, timeRemaining: number, answers: SubmitAnswerRequest[]): Observable<void> {
        const payload = { timeRemaining, answers };
        return this.api.post<void>(`/TestAttempts/${attemptId}/pause`, payload).pipe(
            tap(() => {
                this.currentAttemptSignal.set(null);
                this.clearDraftAnswers();
            })
        );
    }

    /**
     * Save a single answer to draft (auto-save)
     */
    saveDraftAnswer(answer: SubmitAnswerRequest): void {
        const current = new Map(this.draftAnswersSignal());
        current.set(answer.questionId, answer);
        this.draftAnswersSignal.set(current);
        this.persistDraftAnswers();
    }

    /**
     * Get all draft answers as array
     */
    getDraftAnswersArray(): SubmitAnswerRequest[] {
        return Array.from(this.draftAnswersSignal().values());
    }

    /**
     * Get draft answer for a specific question
     */
    getDraftAnswer(questionId: string): SubmitAnswerRequest | undefined {
        return this.draftAnswersSignal().get(questionId);
    }

    /**
     * Clear all draft answers
     */
    clearDraftAnswers(): void {
        this.draftAnswersSignal.set(new Map());
        localStorage.removeItem(ANSWERS_STORAGE_KEY);
    }

    /**
     * Persist draft answers to localStorage
     */
    private persistDraftAnswers(): void {
        const answers = this.getDraftAnswersArray();
        localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
    }

    /**
     * Load draft answers from localStorage
     */
    private loadDraftAnswers(): void {
        const stored = localStorage.getItem(ANSWERS_STORAGE_KEY);
        if (stored) {
            try {
                const answers: SubmitAnswerRequest[] = JSON.parse(stored);
                const map = new Map<string, SubmitAnswerRequest>();
                answers.forEach((a) => map.set(a.questionId, a));
                this.draftAnswersSignal.set(map);
            } catch {
                // Invalid data, clear it
                localStorage.removeItem(ANSWERS_STORAGE_KEY);
            }
        }
    }
}
