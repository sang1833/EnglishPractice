import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionGroupsService } from '../../../core/services/question-groups.service';

@Component({
    selector: 'app-question-group-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div class="bg-white rounded-lg p-6 w-3/4 max-w-4xl h-5/6 flex flex-col">
          <h3 class="text-xl font-bold mb-4">Add Question Group</h3>
          
          <form [formGroup]="groupForm" class="flex-1 flex flex-col overflow-hidden">
             <!-- Group Info -->
             <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <label class="block text-sm font-medium mb-1">Group Title (e.g. Questions 1-5)</label>
                   <input formControlName="title" class="w-full border rounded px-3 py-2">
                </div>
                <div>
                   <label class="block text-sm font-medium mb-1">Instruction (e.g. Choose the correct letter)</label>
                   <input formControlName="instruction" class="w-full border rounded px-3 py-2">
                </div>
             </div>

             <!-- Bulk Questions -->
             <div class="flex-1 flex flex-col mb-4">
                <label class="block text-sm font-medium mb-1">
                   Bulk Questions Input 
                   <span class="text-xs text-gray-500 font-normal ml-2">(Format: 1. Question text... [A. Option A] [B. Option B] *Answer)</span>
                </label>
                <textarea formControlName="bulkContent" class="flex-1 w-full border rounded px-3 py-2 font-mono text-sm" placeholder="1. The capital of France is...
A. London
B. Paris
*B

2. Another question..."></textarea>
             </div>

             <div class="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" (click)="onCancel.emit()" class="px-4 py-2 border rounded">Cancel</button>
                <button type="button" (click)="save()" [disabled]="isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                   <span *ngIf="isSubmitting">Saving...</span>
                   <span *ngIf="!isSubmitting">Save Group & Questions</span>
                </button>
             </div>
          </form>
       </div>
    </div>
  `
})
export class QuestionGroupDialogComponent {
    @Input() sectionId!: string;
    @Output() onCancel = new EventEmitter<void>();
    @Output() onSave = new EventEmitter<any>();

    groupForm: FormGroup;
    isSubmitting = false;

    constructor(private fb: FormBuilder, private qgService: QuestionGroupsService) {
        this.groupForm = this.fb.group({
            title: ['', Validators.required],
            instruction: [''],
            bulkContent: ['']
        });
    }

    save() {
        if (this.groupForm.valid) {
            this.isSubmitting = true;
            const val = this.groupForm.value;

            // 1. Create Group
            // In real app, we parse 'bulkContent' into a list of questions
            // For now, we mock the parsing or send raw content if backend supports it.
            // Assuming backend needs parsed questions. I'll do a dummy parse.

            const questions = this.parseQuestions(val.bulkContent);

            const payload = {
                sectionId: this.sectionId,
                title: val.title,
                instruction: val.instruction,
                orderIndex: 0, // Auto
                questions: questions
            };

            // Mock save
            setTimeout(() => {
                this.isSubmitting = false;
                this.onSave.emit(payload);
            }, 500);

            // Real implementation:
            /*
            this.qgService.createGroup(this.sectionId, payload).subscribe({
               next: (res) => {
                  this.isSubmitting = false;
                  this.onSave.emit(res);
               },
               error: (err) => {
                  this.isSubmitting = false;
                  alert(err);
               }
            });
            */
        }
    }

    // Very basic parser for demo
    parseQuestions(text: string): any[] {
        if (!text) return [];
        // Split by "1. ", "2. " etc - Regex for starting number
        // This is just a placeholder.
        return [{
            orderIndex: 1,
            content: "Parsed question content",
            correctAnswer: "A",
            points: 1
        }];
    }
}
