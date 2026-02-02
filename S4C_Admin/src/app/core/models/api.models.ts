export interface PagedList<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export type ExamStatus = 'Draft' | 'Published' | 'Archived';
export type ExamType = 'IeltsAcademic' | 'IeltsGeneral' | 'Toeic' | 'Other';
export type SkillType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';
export type QuestionType = 'MultipleChoice' | 'FillInTheBlank' | 'TrueFalseNotGiven' | 'MatchingHeadings' | 'DropDown' | 'Essay' | 'SpeakingRecording';
export type UserRole = 'Admin' | 'User' | 'Teacher'; // Inferred

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface LoginResponse {
    token: string;
    // user property structure inferred from typical JWT responses or previous mock
    user?: {
        email: string;
        fullName: string;
        roles: string[];
    };
}

export interface RegisterUserRequest {
    email?: string;
    password?: string;
    fullName?: string;
}

export interface User {
    id?: string;
    email?: string;
    passwordHash?: string;
    fullName?: string;
    avatarUrl?: string;
    role?: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateExamRequest {
    title?: string;
    slug?: string;
    description?: string;
    thumbnailUrl?: string;
    type?: ExamType;
    status?: ExamStatus;
    duration?: number;
}

export interface UpdateExamRequest {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    type?: ExamType;
    status?: ExamStatus;
    duration?: number;
}

export interface ExamDto {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    thumbnailUrl?: string;
    type?: ExamType;
    status?: ExamStatus;
    duration?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExamListDto {
    id?: string;
    title?: string;
    slug?: string;
    thumbnailUrl?: string;
    type?: ExamType;
    status?: ExamStatus;
    duration?: number;
    availableSkills?: string[];
    targetSkill?: string;
}

export interface CreateExamSectionRequest {
    title: string;
    orderIndex?: number;
    audioUrl?: string;
    textContent?: string;
    transcript?: string;
    imageUrl?: string;
    questionGroups?: QuestionGroupImportDto[];
}

export interface QuestionGroupImportDto {
    title?: string;
    instruction?: string;
    questionType?: QuestionType;
    orderIndex?: number;
    imageUrl?: string;
    textContent?: string;
    audioUrl?: string;
    questions?: QuestionImportDto[];
}

export interface QuestionImportDto {
    orderIndex?: number;
    content?: string;
    options?: string;
    correctAnswer?: string;
    points?: number;
    explanation?: string;
}

export interface ExamSkill {
    id?: string;
    examId?: string;
    title?: string;
    skill?: SkillType;
    orderIndex?: number;
    duration?: number;
    exam?: ExamDto; // Simplification, swagger has Exam
    sections?: ExamSection[];
}

export interface ExamSection {
    id?: string;
    skillId?: string;
    title?: string;
    orderIndex?: number;
    textContent?: string;
    audioUrl?: string;
    imageUrl?: string;
    transcript?: string;
    skill?: ExamSkill;
    groups?: QuestionGroup[];
}

export interface QuestionGroup {
    id?: string;
    sectionId?: string;
    title?: string;
    instruction?: string;
    questionType?: QuestionType;
    orderIndex?: number;
    imageUrl?: string;
    textContent?: string;
    audioUrl?: string;
    section?: ExamSection;
    questions?: Question[];
}

export interface Question {
    id?: string;
    groupId?: string;
    orderIndex?: number;
    content?: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
    points?: number;
    group?: QuestionGroup;
}

export interface Exam {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    thumbnailUrl?: string;
    type?: ExamType;
    status?: ExamStatus;
    duration?: number;
    createdAt?: string;
    updatedAt?: string;
    skills?: ExamSkill[];
    attempts?: TestAttempt[];
}

export interface TestAttempt {
    id?: string;
    userId?: string;
    examId?: string;
    startedAt?: string;
    completedAt?: string;
    status?: string; // AttemptStatus
    overallScore?: number;
    // ... add other fields as needed
}
