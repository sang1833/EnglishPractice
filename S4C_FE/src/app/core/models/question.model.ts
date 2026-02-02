import { QuestionType } from './common.model';

/**
 * Question group with shared instruction
 */
export interface QuestionGroup {
    id: string;
    sectionId: string;
    title: string;
    instruction?: string;
    questionType: QuestionType;
    orderIndex: number;
    questions: Question[];
}

/**
 * Question group DTO
 */
export interface QuestionGroupDto {
    id: string;
    sectionId: string;
    title: string;
    instruction?: string;
    questionType: QuestionType;
    orderIndex: number;
    questions: QuestionDto[];
}

/**
 * Individual question
 */
export interface Question {
    id: string;
    groupId: string;
    orderIndex: number;
    content: string;
    options?: string;       // JSON string of options for MCQ
    correctAnswer?: string; // JSON string of correct answer(s)
    explanation?: string;
    points: number;
}

/**
 * Question DTO
 */
export interface QuestionDto {
    id: string;
    groupId: string;
    orderIndex: number;
    content: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
    points: number;
}

/**
 * Parsed options for Multiple Choice questions
 */
export interface MCQOption {
    key: string;   // A, B, C, D
    text: string;  // Option text
}

/**
 * Create question request
 */
export interface CreateQuestionRequest {
    orderIndex: number;
    content: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
    points: number;
}

/**
 * Update question request
 */
export interface UpdateQuestionRequest {
    orderIndex?: number;
    content?: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
    points?: number;
}
