export enum ExamType {
    IeltsAcademic = 'IeltsAcademic',
    IeltsGeneral = 'IeltsGeneral',
    Toeic = 'Toeic',
    Toefl = 'Toefl'
}

export enum ExamStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived'
}

export enum SkillType {
    Listening = 'Listening',
    Reading = 'Reading',
    Writing = 'Writing',
    Speaking = 'Speaking'
}

export interface Exam {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    type: ExamType;
    status: ExamStatus;
    duration: number;
    createdAt: string;
    updatedAt: string;
}

export interface ExamSkill {
    id: string;
    examId: string;
    title: string;
    skill: SkillType;
    orderIndex: number;
    duration: number;
    sections?: ExamSection[];
}

export interface ExamSection {
    id: string;
    skillId: string;
    title: string;
    orderIndex: number;
    textContent?: string;
    audioUrl?: string;
    imageUrl?: string;
    transcript?: string;
    questionGroups?: QuestionGroup[];
}

export interface QuestionGroup {
    id: string;
    sectionId?: string; // Optional if created via Skill directly, but technically under Section
    title?: string;
    orderIndex: number;
    instruction?: string;
    questionType?: string; // Optional enum
    questions?: Question[];
}

export interface Question {
    id: string;
    groupId: string;
    orderIndex: number;
    content?: string;
    options?: string; // JSON string
    correctAnswer: string;
    explanation?: string;
    points: number;
}

// Import DTOs (Simplified versions for JSON Import)
export interface CreateExamRequest {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    type: ExamType;
    duration: number;
    skills?: CreateExamSkillRequest[];
}

export interface CreateExamSkillRequest {
    title: string;
    skillType: SkillType;
    orderIndex: number;
    duration: number;
    sections: CreateExamSectionRequest[];
}

export interface CreateExamSectionRequest {
    title: string;
    orderIndex: number;
    audioUrl?: string;
    textContent?: string;
    transcript?: string;
    questionGroups: CreateQuestionGroupRequest[];
}

export interface CreateQuestionGroupRequest {
    title?: string;
    orderIndex: number;
    instruction?: string;
    questionType?: string;
    questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
    orderIndex: number;
    content?: string;
    options?: string;
    correctAnswer: string;
    points: number;
    explanation?: string;
}
