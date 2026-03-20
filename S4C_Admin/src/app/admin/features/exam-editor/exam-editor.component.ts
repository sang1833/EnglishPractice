import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdminExamEditorDto,
  AdminExamSectionEditorDto,
  AdminExamSkillEditorDto,
  AdminQuestionEditorDto,
  AdminQuestionGroupEditorDto,
  ExamStatus,
  ExamType,
  QuestionType,
  SkillType
} from '../../../core/models/api.models';
import { ExamsService } from '../../../core/services/exams.service';

@Component({
  selector: 'app-exam-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-editor.component.html'
})
export class ExamEditorComponent implements OnInit {
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly isEditMode = signal(false);

  protected readonly examTypes: ExamType[] = ['IeltsAcademic', 'IeltsGeneral', 'Toeic', 'Other'];
  protected readonly examStatuses: ExamStatus[] = ['Draft', 'Published', 'Archived'];
  protected readonly skillTypes: SkillType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];
  protected readonly questionTypes: QuestionType[] = [
    'MultipleChoice',
    'FillInTheBlank',
    'TrueFalseNotGiven',
    'MatchingHeadings',
    'DropDown',
    'Essay',
    'SpeakingRecording'
  ];

  private examId: string | null = null;

  readonly examForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly examsService: ExamsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.examForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      slug: [''],
      description: [''],
      thumbnailUrl: [''],
      type: ['IeltsAcademic', Validators.required],
      status: ['Draft', Validators.required],
      duration: [170, [Validators.required, Validators.min(1)]],
      skills: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.isEditMode.set(true);
      this.examId = examId;
      this.loadExam(examId);
      return;
    }

    this.applyIeltsPreset();
  }

  get skills(): FormArray {
    return this.examForm.get('skills') as FormArray;
  }

  sections(skillIndex: number): FormArray {
    return this.skills.at(skillIndex).get('sections') as FormArray;
  }

  groups(skillIndex: number, sectionIndex: number): FormArray {
    return this.sections(skillIndex).at(sectionIndex).get('questionGroups') as FormArray;
  }

  questions(skillIndex: number, sectionIndex: number, groupIndex: number): FormArray {
    return this.groups(skillIndex, sectionIndex).at(groupIndex).get('questions') as FormArray;
  }

  trackByIndex(index: number): number {
    return index;
  }

  addSkill(skillType?: SkillType): void {
    const resolvedSkill = skillType ?? 'Reading';
    this.skills.push(
      this.createSkillGroup({
        skill: resolvedSkill,
        title: resolvedSkill,
        duration: this.defaultDurationForSkill(resolvedSkill),
        orderIndex: this.skills.length + 1
      })
    );
    this.resequence(this.skills);
  }

  removeSkill(skillIndex: number): void {
    this.skills.removeAt(skillIndex);
    this.resequence(this.skills);
  }

  applyIeltsPreset(): void {
    const defaults: SkillType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];

    for (const skillType of defaults) {
      const exists = this.skills.controls.some(control => control.get('skill')?.value === skillType);
      if (!exists) {
        this.addSkill(skillType);
      }
    }
  }

  addSection(skillIndex: number): void {
    this.sections(skillIndex).push(
      this.createSectionGroup({
        title: `Section ${this.sections(skillIndex).length + 1}`,
        orderIndex: this.sections(skillIndex).length + 1
      })
    );
    this.resequence(this.sections(skillIndex));
  }

  removeSection(skillIndex: number, sectionIndex: number): void {
    this.sections(skillIndex).removeAt(sectionIndex);
    this.resequence(this.sections(skillIndex));
  }

  addGroup(skillIndex: number, sectionIndex: number): void {
    this.groups(skillIndex, sectionIndex).push(
      this.createQuestionGroup({
        title: `Group ${this.groups(skillIndex, sectionIndex).length + 1}`,
        questionType: 'MultipleChoice',
        orderIndex: this.groups(skillIndex, sectionIndex).length + 1
      })
    );
    this.resequence(this.groups(skillIndex, sectionIndex));
  }

  removeGroup(skillIndex: number, sectionIndex: number, groupIndex: number): void {
    this.groups(skillIndex, sectionIndex).removeAt(groupIndex);
    this.resequence(this.groups(skillIndex, sectionIndex));
  }

  addQuestion(skillIndex: number, sectionIndex: number, groupIndex: number): void {
    this.questions(skillIndex, sectionIndex, groupIndex).push(
      this.createQuestion({
        orderIndex: this.questions(skillIndex, sectionIndex, groupIndex).length + 1,
        correctAnswer: '',
        points: 1
      })
    );
    this.resequence(this.questions(skillIndex, sectionIndex, groupIndex));
  }

  removeQuestion(skillIndex: number, sectionIndex: number, groupIndex: number, questionIndex: number): void {
    this.questions(skillIndex, sectionIndex, groupIndex).removeAt(questionIndex);
    this.resequence(this.questions(skillIndex, sectionIndex, groupIndex));
  }

  onSubmit(): void {
    this.error.set(null);
    this.success.set(null);

    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      this.error.set('Please complete the required exam fields before saving.');
      return;
    }

    const payload = this.buildPayload();
    this.isSaving.set(true);

    const request$ = this.examId
      ? this.examsService.updateAdminExam(this.examId, payload)
      : this.examsService.createAdminExam(payload);

    request$.subscribe({
      next: savedExam => {
        this.isSaving.set(false);
        this.success.set('Exam saved successfully.');
        this.patchForm(savedExam);

        if (!this.examId && savedExam.id) {
          this.examId = savedExam.id;
          this.isEditMode.set(true);
          this.router.navigate(['/admin/exams', savedExam.id]);
        }
      },
      error: err => {
        this.isSaving.set(false);
        this.error.set(err.error?.error || err.error?.message || err.message || 'Failed to save exam.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/exams']);
  }

  private loadExam(examId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.examsService.getAdminExam(examId).subscribe({
      next: exam => {
        this.patchForm(exam);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.error.set(err.error?.error || err.error?.message || err.message || 'Failed to load exam.');
      }
    });
  }

  private patchForm(exam: AdminExamEditorDto): void {
    this.examForm.patchValue({
      id: exam.id ?? '',
      title: exam.title,
      slug: exam.slug ?? '',
      description: exam.description ?? '',
      thumbnailUrl: exam.thumbnailUrl ?? '',
      type: exam.type,
      status: exam.status,
      duration: exam.duration
    });

    this.skills.clear();
    for (const skill of exam.skills ?? []) {
      this.skills.push(this.createSkillGroup(skill));
    }
  }

  private buildPayload(): AdminExamEditorDto {
    const value = this.examForm.getRawValue();

    return {
      id: this.normalizeOptionalString(value.id),
      title: String(value.title ?? '').trim(),
      slug: this.normalizeOptionalString(value.slug),
      description: this.normalizeOptionalString(value.description),
      thumbnailUrl: this.normalizeOptionalString(value.thumbnailUrl),
      type: value.type as ExamType,
      status: value.status as ExamStatus,
      duration: Number(value.duration),
      skills: this.skills.controls.map(skillControl => this.mapSkill(skillControl))
    };
  }

  private mapSkill(control: AbstractControl): AdminExamSkillEditorDto {
    const value = control.getRawValue();
    const sections = control.get('sections') as FormArray;

    return {
      id: this.normalizeOptionalString(value.id),
      title: String(value.title ?? '').trim(),
      skill: value.skill as SkillType,
      orderIndex: Number(value.orderIndex),
      duration: Number(value.duration),
      sections: sections.controls.map(sectionControl => this.mapSection(sectionControl))
    };
  }

  private mapSection(control: AbstractControl): AdminExamSectionEditorDto {
    const value = control.getRawValue();
    const groups = control.get('questionGroups') as FormArray;

    return {
      id: this.normalizeOptionalString(value.id),
      title: String(value.title ?? '').trim(),
      orderIndex: Number(value.orderIndex),
      audioUrl: this.normalizeOptionalString(value.audioUrl),
      textContent: this.normalizeOptionalString(value.textContent),
      transcript: this.normalizeOptionalString(value.transcript),
      imageUrl: this.normalizeOptionalString(value.imageUrl),
      questionGroups: groups.controls.map(groupControl => this.mapGroup(groupControl))
    };
  }

  private mapGroup(control: AbstractControl): AdminQuestionGroupEditorDto {
    const value = control.getRawValue();
    const questions = control.get('questions') as FormArray;

    return {
      id: this.normalizeOptionalString(value.id),
      title: this.normalizeOptionalString(value.title),
      instruction: this.normalizeOptionalString(value.instruction),
      questionType: value.questionType as QuestionType,
      orderIndex: Number(value.orderIndex),
      imageUrl: this.normalizeOptionalString(value.imageUrl),
      textContent: this.normalizeOptionalString(value.textContent),
      audioUrl: this.normalizeOptionalString(value.audioUrl),
      questions: questions.controls.map(questionControl => this.mapQuestion(questionControl))
    };
  }

  private mapQuestion(control: AbstractControl): AdminQuestionEditorDto {
    const value = control.getRawValue();

    return {
      id: this.normalizeOptionalString(value.id),
      orderIndex: Number(value.orderIndex),
      content: this.normalizeOptionalString(value.content),
      options: this.normalizeOptionalString(value.options),
      correctAnswer: value.correctAnswer?.trim() ?? '',
      points: Number(value.points),
      explanation: this.normalizeOptionalString(value.explanation)
    };
  }

  private createSkillGroup(skill?: Partial<AdminExamSkillEditorDto>): FormGroup {
    return this.fb.group({
      id: [skill?.id ?? ''],
      title: [skill?.title ?? '', Validators.required],
      skill: [skill?.skill ?? 'Reading', Validators.required],
      orderIndex: [skill?.orderIndex ?? this.skills.length + 1],
      duration: [skill?.duration ?? 60, [Validators.required, Validators.min(1)]],
      sections: this.fb.array((skill?.sections ?? []).map(section => this.createSectionGroup(section)))
    });
  }

  private createSectionGroup(section?: Partial<AdminExamSectionEditorDto>): FormGroup {
    return this.fb.group({
      id: [section?.id ?? ''],
      title: [section?.title ?? '', Validators.required],
      orderIndex: [section?.orderIndex ?? 1],
      audioUrl: [section?.audioUrl ?? ''],
      textContent: [section?.textContent ?? ''],
      transcript: [section?.transcript ?? ''],
      imageUrl: [section?.imageUrl ?? ''],
      questionGroups: this.fb.array(
        (section?.questionGroups ?? []).map(group => this.createQuestionGroup(group))
      )
    });
  }

  private createQuestionGroup(group?: Partial<AdminQuestionGroupEditorDto>): FormGroup {
    return this.fb.group({
      id: [group?.id ?? ''],
      title: [group?.title ?? ''],
      instruction: [group?.instruction ?? ''],
      questionType: [group?.questionType ?? 'MultipleChoice'],
      orderIndex: [group?.orderIndex ?? 1],
      imageUrl: [group?.imageUrl ?? ''],
      textContent: [group?.textContent ?? ''],
      audioUrl: [group?.audioUrl ?? ''],
      questions: this.fb.array((group?.questions ?? []).map(question => this.createQuestion(question)))
    });
  }

  private createQuestion(question?: Partial<AdminQuestionEditorDto>): FormGroup {
    return this.fb.group({
      id: [question?.id ?? ''],
      orderIndex: [question?.orderIndex ?? 1],
      content: [question?.content ?? ''],
      options: [question?.options ?? ''],
      correctAnswer: [question?.correctAnswer ?? '', Validators.required],
      points: [question?.points ?? 1, [Validators.required, Validators.min(0)]],
      explanation: [question?.explanation ?? '']
    });
  }

  private resequence(array: FormArray): void {
    array.controls.forEach((control, index) => {
      const orderIndex = control.get('orderIndex');
      if (orderIndex) {
        orderIndex.patchValue(index + 1, { emitEvent: false });
      }
    });
  }

  private normalizeOptionalString(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private defaultDurationForSkill(skillType: SkillType): number {
    switch (skillType) {
      case 'Listening':
        return 30;
      case 'Reading':
        return 60;
      case 'Writing':
        return 60;
      case 'Speaking':
        return 15;
      default:
        return 30;
    }
  }
}
