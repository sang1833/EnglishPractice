import { AttemptStatus, SkillType } from './common.model';

/**
 * Test attempt entity
 */
export interface TestAttempt {
    id: string;
    userId: string;
    examId: string;
    startedAt: string;
    completedAt?: string;
    status: AttemptStatus;
    overallScore?: number;
    listeningScore?: number;
    readingScore?: number;
    writingScore?: number;
    speakingScore?: number;
    timeRemaining?: number; // Seconds
    savedAnswers?: SubmitAnswerRequest[];
}

/**
 * Test attempt DTO with exam title
 */
export interface TestAttemptDto {
    id: string;
    userId: string;
    examId: string;
    examTitle: string;
    startedAt: string;
    completedAt?: string;
    status: AttemptStatus;
    overallScore?: number;
    listeningScore?: number;
    readingScore?: number;
    writingScore?: number;
    speakingScore?: number;
    timeRemaining?: number; // Seconds
    savedAnswers?: SubmitAnswerRequest[];
    selectedSkills?: string; // Comma-separated
}

/**
 * Test attempt list item
 */
export interface TestAttemptListDto {
    id: string;
    examId: string;
    examTitle: string;
    startedAt: string;
    completedAt?: string;
    status: AttemptStatus;
    overallScore?: number;
    selectedSkills?: string;
    isFullTest: boolean;
}

/**
 * Start test request
 */
export interface StartTestRequest {
    examId: string;
    selectedSkills?: string[];
}

/**
 * Submit answer for a single question
 */
export interface SubmitAnswerRequest {
    questionId: string;
    textContent?: string;      // For fill-in-blank answers
    selectedOptions?: string;  // JSON string of selected options for MCQ
    audioUrl?: string;         // For speaking recordings
}

/**
 * Submit all answers for a test
 */
export interface SubmitTestRequest {
    answers: SubmitAnswerRequest[];
}

/**
 * User answer entity
 */
export interface UserAnswer {
    id: string;
    attemptId: string;
    questionId: string;
    audioUrl?: string;
    textContent?: string;
    selectedOptions?: string;
    isCorrect?: boolean;
    scoreEarned?: number;
    feedback?: string;
}

/**
 * Skill-level result
 */
export interface SkillResultDto {
    skill: SkillType;
    skillName: string;
    correctCount: number;
    totalQuestions: number;
    bandScore: number;
}

/**
 * Question-level result
 */
export interface QuestionResultDto {
    questionId: string;
    questionNumber: number;
    questionContent: string;
    userAnswer?: string;
    correctAnswer?: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    explanation?: string;
}

/**
 * Complete test result
 */
export interface TestResultDto {
    attemptId: string;
    examId: string;
    examTitle: string;
    overallBandScore: number;
    totalCorrect: number;
    totalQuestions: number;
    percentageScore: number;
    startedAt: string;
    completedAt?: string;
    timeTaken: string; // ISO duration or formatted string
    skillResults: SkillResultDto[];
    questionResults: QuestionResultDto[];
}
