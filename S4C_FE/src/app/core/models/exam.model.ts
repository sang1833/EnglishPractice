import { ExamType, ExamStatus, SkillType, QuestionType } from './common.model';
import { QuestionGroup, QuestionGroupDto } from './question.model';

/**
 * Exam list item (for paginated list)
 */
export interface ExamListDto {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    type: ExamType;
    status: ExamStatus;
    duration: number; // Total duration in minutes
    availableSkills: string[];
}

/**
 * Exam detail DTO
 */
export interface ExamDto {
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
    availableSkills: string[];
}

/**
 * Full exam with all skills (for test taking)
 */
export interface Exam extends ExamDto {
    skills: ExamSkill[];
}

/**
 * Exam skill (Listening, Reading, etc.)
 */
export interface ExamSkill {
    id: string;
    examId: string;
    title: string;
    skill: SkillType;
    orderIndex: number;
    duration: number; // Duration in minutes
    sections: ExamSection[];
}

/**
 * Exam skill for list view (without sections)
 */
export interface ExamSkillListDto {
    id: string;
    title: string;
    skill: SkillType;
    orderIndex: number;
    duration: number;
    sectionCount: number;
}

/**
 * Skill DTO with sections
 */
export interface ExamSkillDto {
    id: string;
    examId: string;
    title: string;
    skill: SkillType;
    orderIndex: number;
    duration: number;
    sections: ExamSectionDto[];
}

/**
 * Exam section (Passage, Audio Part)
 */
export interface ExamSection {
    id: string;
    skillId: string;
    title: string;
    orderIndex: number;
    textContent?: string;  // Reading passage HTML
    audioUrl?: string;     // Listening audio URL
    imageUrl?: string;     // Optional image
    transcript?: string;   // Audio transcript
    groups: QuestionGroup[];
}

/**
 * Exam section DTO
 */
export interface ExamSectionDto {
    id: string;
    skillId: string;
    title: string;
    orderIndex: number;
    textContent?: string;
    audioUrl?: string;
    imageUrl?: string;
    transcript?: string;
    groups: QuestionGroupDto[];
}
