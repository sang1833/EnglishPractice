import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamsService } from '../../../core/services/exams.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-import',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex items-center space-x-4">
        <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Import Exam from JSON</h1>
          <p class="text-sm text-gray-600 mt-1">Upload a JSON file containing the complete exam structure</p>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          @for (step of steps; track step.id; let i = $index) {
            <div class="flex items-center" [class.flex-1]="i < steps.length - 1">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                  [ngClass]="{
                    'bg-blue-600 border-blue-600 text-white': currentStep() >= i + 1,
                    'bg-white border-gray-300 text-gray-400': currentStep() < i + 1
                  }">
                  @if (currentStep() > i + 1) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="text-sm font-semibold">{{ i + 1 }}</span>
                  }
                </div>
                <span class="mt-2 text-xs font-medium" [class.text-gray-900]="currentStep() >= i + 1" [class.text-gray-400]="currentStep() < i + 1">
                  {{ step.label }}
                </span>
              </div>
              @if (i < steps.length - 1) {
                <div class="flex-1 h-0.5 mx-4" [class.bg-blue-600]="currentStep() > i + 1" [class.bg-gray-300]="currentStep() <= i + 1"></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Upload Form -->
      <div class="bg-white rounded-xl shadow-md p-8">
        <form [formGroup]="importForm" (ngSubmit)="onSubmit()">
          
          <!-- File Upload Zone -->
          <div class="mb-8">
            <label class="block text-sm font-semibold text-gray-900 mb-3">Upload JSON File</label>
            <div class="relative">
              <label for="dropzone-file" 
                class="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl cursor-pointer transition-all"
                [ngClass]="{
                  'border-blue-400 bg-blue-50': isDragging(),
                  'border-gray-300 bg-gray-50 hover:bg-gray-100': !isDragging()
                }"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  @if (!fileName()) {
                    <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="mb-2 text-base font-medium text-gray-700">
                      <span class="text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-sm text-gray-500">JSON file (MAX. 5MB)</p>
                  } @else {
                    <svg class="w-16 h-16 mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-base font-semibold text-gray-900 mb-1">{{ fileName() }}</p>
                    <p class="text-sm text-gray-500">Ready to import</p>
                    <button type="button" (click)="clearFile(); $event.stopPropagation()" class="mt-4 text-sm text-red-600 hover:text-red-700 font-medium">
                      Remove file
                    </button>
                  }
                </div>
                <input id="dropzone-file" type="file" class="hidden" accept=".json" (change)="onFileSelected($event)" />
              </label>
            </div>
          </div>

          <!-- Divider -->
          <div class="relative mb-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          <!-- Text Area -->
          <div class="mb-8">
            <label class="block text-sm font-semibold text-gray-900 mb-3">Paste JSON Content</label>
            <textarea 
              formControlName="jsonContent" 
              rows="12" 
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
              [class.border-red-300]="jsonError()"
              [class.bg-red-50]="jsonError()"
              placeholder='{\n  "title": "IELTS Academic Test",\n  "type": "IeltsAcademic",\n  "duration": 170,\n  ...\n}'></textarea>
            @if (jsonError()) {
              <div class="mt-2 flex items-center text-sm text-red-600">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ jsonError() }}
              </div>
            }
          </div>

          <!-- Preview Section -->
          @if (previewData()) {
            <div class="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 class="text-base font-semibold text-gray-900">Preview</h3>
                </div>
                <button type="button" (click)="previewData.set(null)" class="text-sm text-gray-500 hover:text-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="bg-white rounded-lg p-4 max-h-96 overflow-auto border border-blue-100">
                <pre class="text-xs text-gray-700">{{ previewData() | json }}</pre>
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <button 
              type="button" 
              (click)="goBack()"
              class="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </button>
            
            <div class="flex items-center space-x-3">
              @if (previewData()) {
                <button 
                  type="button"
                  (click)="validateAndPreview(importForm.get('jsonContent')?.value || '')"
                  class="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Preview
                </button>
              }
              <button 
                type="submit" 
                [disabled]="importForm.invalid || isSubmitting()"
                class="inline-flex items-center px-6 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                } @else {
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import Exam
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExamImportComponent {
  importForm: FormGroup;
  protected isSubmitting = signal(false);
  protected fileName = signal<string | null>(null);
  protected jsonError = signal<string | null>(null);
  protected previewData = signal<any>(null);
  protected isDragging = signal(false);
  protected currentStep = signal(1);

  protected steps = [
    { id: 1, label: 'Upload' },
    { id: 2, label: 'Validate' },
    { id: 3, label: 'Import' }
  ];

  constructor(
    private fb: FormBuilder,
    private examsService: ExamsService,
    private router: Router
  ) {
    this.importForm = this.fb.group({
      jsonContent: ['', [Validators.required, this.jsonValidator]]
    });
  }

  jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName.set(file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        this.importForm.patchValue({ jsonContent: content });
        this.validateAndPreview(content);
        this.currentStep.set(2);
      };
      reader.readAsText(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.fileName.set(file.name);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const content = e.target.result;
          this.importForm.patchValue({ jsonContent: content });
          this.validateAndPreview(content);
          this.currentStep.set(2);
        };
        reader.readAsText(file);
      } else {
        this.jsonError.set('Please upload a valid JSON file');
      }
    }
  }

  clearFile() {
    this.fileName.set(null);
    this.importForm.patchValue({ jsonContent: '' });
    this.previewData.set(null);
    this.jsonError.set(null);
    this.currentStep.set(1);
  }

  validateAndPreview(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      this.previewData.set(data);
      this.jsonError.set(null);
    } catch (e) {
      this.jsonError.set("Invalid JSON syntax. Please check your file or content.");
      this.previewData.set(null);
    }
  }

  onSubmit() {
    if (this.importForm.invalid) return;

    const jsonStr = this.importForm.get('jsonContent')?.value;
    try {
      const data = JSON.parse(jsonStr);
      this.isSubmitting.set(true);
      this.currentStep.set(3);

      this.examsService.importExam(data).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          // Show success message
          this.router.navigate(['/admin/exams']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.jsonError.set('Error importing exam: ' + (err.error?.message || err.message));
          this.currentStep.set(2);
        }
      });
    } catch (e) {
      this.jsonError.set("Invalid JSON format");
    }
  }

  goBack() {
    this.router.navigate(['/admin/exams']);
  }
}
