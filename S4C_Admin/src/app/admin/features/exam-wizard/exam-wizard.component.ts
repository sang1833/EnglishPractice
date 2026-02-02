import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamsService } from '../../../core/services/exams.service';
import { ExamType, SkillType } from '../../../core/models/api.models';

@Component({
  selector: 'app-exam-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex items-center space-x-4">
        <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Exam</h1>
          <p class="text-sm text-gray-600 mt-1">Set up IELTS exam step by step</p>
        </div>
      </div>

      <!-- Wizard Stepper -->
      <div class="bg-white rounded-xl shadow-md p-8">
        <div class="relative">
          <!-- Progress Bar -->
          <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div class="h-full bg-blue-600 transition-all duration-500" [style.width.%]="getProgressPercentage()"></div>
          </div>

          <!-- Steps -->
          <div class="relative flex justify-between">
            @for (step of steps; track step; let i = $index) {
              <div class="flex flex-col items-center z-10">
                <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all"
                  [ngClass]="{
                    'border-blue-600 bg-blue-600 text-white shadow-lg': currentStep() > i + 1,
                    'border-blue-600 text-blue-600 bg-white ring-4 ring-blue-100': currentStep() === i + 1,
                    'border-gray-300 text-gray-400 bg-white': currentStep() < i + 1
                  }">
                  @if (currentStep() > i + 1) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="text-sm font-bold">{{ i + 1 }}</span>
                  }
                </div>
                <span class="mt-3 text-xs font-semibold px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                  [ngClass]="{
                    'bg-blue-100 text-blue-700': currentStep() === i + 1,
                    'text-gray-900': currentStep() > i + 1,
                    'text-gray-500': currentStep() < i + 1
                  }">
                  {{ step }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="bg-white rounded-xl shadow-md p-8">
        <form [formGroup]="examForm">
          
          <!-- Step 1: Basic Info -->
          @if (currentStep() === 1) {
            <div class="animate-fade-in space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Exam Information
                </h2>
              </div>

              <div class="grid grid-cols-1 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">
                    Exam Title <span class="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="title" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., IELTS Academic Test #45"
                  >
                  @if (examForm.get('title')?.invalid && examForm.get('title')?.touched) {
                    <p class="mt-2 text-sm text-red-600">Title is required</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea 
                    formControlName="description" 
                    rows="4" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Provide a detailed description of this exam..."></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Exam Type <span class="text-red-500">*</span>
                    </label>
                    <select 
                      formControlName="type" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option *ngFor="let type of examTypes" [value]="type">{{ type }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Duration (minutes) <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      formControlName="duration" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="170"
                    >
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Step 2: Skills Configuration -->
          @if (currentStep() === 2) {
            <div class="animate-fade-in space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Skills Configuration
                </h2>
                <div class="flex flex-wrap gap-2">
                   <button *ngFor="let skill of skillTypes"
                           type="button"
                           (click)="createSkill(skill)"
                           class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                      + {{ skill }}
                   </button>
                </div>
              </div>
              
              <div formArrayName="skills" class="space-y-4">
                @for (skill of skills.controls; track skill; let i = $index) {
                  <div [formGroupName]="i" class="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 relative group hover:shadow-md transition-all">
                    <button 
                      type="button" 
                      (click)="removeSkill(i)" 
                      class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group hover:opacity-100"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div class="grid grid-cols-12 gap-4">
                      <div class="col-span-12 md:col-span-4">
                        <label class="block text-xs font-semibold text-gray-700 mb-2">Skill Type *</label>
                        <select 
                          formControlName="skillType" 
                          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          @for (type of skillTypes; track type) {
                            <option [value]="type">{{ type }}</option>
                          }
                        </select>
                      </div>

                      <div class="col-span-12 md:col-span-5">
                        <label class="block text-xs font-semibold text-gray-700 mb-2">Title *</label>
                        <input 
                          type="text" 
                          formControlName="title" 
                          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Enter skill title"
                        >
                      </div>

                      <div class="col-span-12 md:col-span-3">
                        <label class="block text-xs font-semibold text-gray-700 mb-2">Duration (min)</label>
                        <input 
                          type="number" 
                          formControlName="duration" 
                          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                      </div>
                    </div>
                  </div>
                }
              </div>

              @if (skills.length === 0) {
                <div class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="mt-2 text-sm font-medium text-gray-900">No skills added yet</p>
                  <p class="text-xs text-gray-500 mt-1">Click "Add Skill" to get started</p>
                </div>
              }
            </div>
          }

          <!-- Step 3: Summary -->
          @if (currentStep() === 3) {
            <div class="animate-fade-in space-y-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review & Create
              </h2>

              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 class="font-semibold text-gray-900 mb-4">Exam Summary</h3>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Title</dt>
                    <dd class="mt-1 text-base font-semibold text-gray-900">{{ examForm.get('title')?.value || 'Not set' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Type</dt>
                    <dd class="mt-1 text-base font-semibold text-gray-900">{{ examForm.get('type')?.value }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Duration</dt>
                    <dd class="mt-1 text-base font-semibold text-gray-900">{{ examForm.get('duration')?.value }} minutes</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Skills</dt>
                    <dd class="mt-1 text-base font-semibold text-gray-900">{{ skills.length }} configured</dd>
                  </div>
                </dl>
              </div>

              @if (examForm.get('description')?.value) {
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                  <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{{ examForm.get('description')?.value }}</p>
                </div>
              }
            </div>
          }

          <!-- Wizard Footer Actions -->
          <div class="sticky bottom-0 mt-8 pt-6 border-t border-gray-200 bg-white flex items-center justify-between">
            <button 
              type="button" 
              *ngIf="currentStep() > 1" 
              (click)="prevStep()" 
              class="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div class="ml-auto flex items-center space-x-3">
              <button 
                type="button" 
                (click)="goBack()"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              @if (currentStep() < steps.length) {
                <button 
                  type="button" 
                  (click)="nextStep()" 
                  class="inline-flex items-center px-6 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Next
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              } @else {
                <button 
                  type="submit" 
                  (click)="onSubmit()"
                  class="inline-flex items-center px-6 py-2.5 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Create Exam
                </button>
              }
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExamWizardComponent {
  protected currentStep = signal(1);
  protected steps = ['Basic Info', 'Skills', 'Review'];

  protected examTypes: ExamType[] = ['IeltsAcademic', 'IeltsGeneral', 'Toeic', 'Other'];
  protected skillTypes: SkillType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];

  examForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private examsService: ExamsService,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['IeltsAcademic'],
      duration: [170, Validators.required],
      skills: this.fb.array([])
    });

    // Default Skills for IELTS
    this.createSkill('Listening', 'Listening', 30);
    this.createSkill('Reading', 'Reading', 60);
    this.createSkill('Writing', 'Writing', 60);
    this.createSkill('Speaking', 'Speaking', 15);
  }

  get skills() {
    return this.examForm.get('skills') as FormArray;
  }

  createSkill(skill: SkillType, title: string = '', duration: number = 30) {
    if (this.skills.value.some((s: any) => s.skillType === skill)) return;

    const skillGroup = this.fb.group({
      skillType: [skill, Validators.required],
      title: [title || skill, Validators.required],
      duration: [duration],
      orderIndex: [this.skills.length + 1]
    });
    this.skills.push(skillGroup);
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  nextStep() {
    if (this.currentStep() < this.steps.length) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  getProgressPercentage(): number {
    return ((this.currentStep() - 1) / (this.steps.length - 1)) * 100;
  }

  onSubmit() {
    if (this.examForm.valid) {
      const formVal = this.examForm.value;
      const payload: any = {
        ...formVal,
        skills: formVal.skills.map((s: any) => ({
          ...s,
          sections: []
        }))
      };

      this.examsService.createExam(payload).subscribe({
        next: (exam) => {
          this.router.navigate(['/admin/exams']);
        },
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
