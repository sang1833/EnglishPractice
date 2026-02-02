/**
 * Generic paged list wrapper for paginated API responses
 */
export interface PagedList<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

/**
 * IELTS Skill Types
 */
export enum SkillType {
    Listening = 'Listening',
    Reading = 'Reading',
    Writing = 'Writing',
    Speaking = 'Speaking'
}

/**
 * Question Types supported by the system
 */
export enum QuestionType {
    MultipleChoice = 'MultipleChoice',
    FillInTheBlank = 'FillInTheBlank',
    TrueFalseNotGiven = 'TrueFalseNotGiven',
    MatchingHeadings = 'MatchingHeadings',
    DropDown = 'DropDown',
    Essay = 'Essay',
    SpeakingRecording = 'SpeakingRecording'
}

/**
 * Exam Types
 */
export enum ExamType {
    IeltsAcademic = 'IeltsAcademic',
    IeltsGeneral = 'IeltsGeneral',
    Toeic = 'Toeic',
    Other = 'Other'
}

/**
 * Exam Status
 */
export enum ExamStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived'
}

/**
 * Test Attempt Status
 */
export enum AttemptStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Abandoned = 'Abandoned'
}

/**
 * User Roles
 */
export enum UserRole {
    User = 'User',
    Admin = 'Admin',
    ContentCreator = 'ContentCreator'
}
