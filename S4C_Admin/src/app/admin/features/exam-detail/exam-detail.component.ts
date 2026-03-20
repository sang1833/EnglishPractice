import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExamsService } from '../../../core/services/exams.service';
import { Exam, ExamSkill, ExamSection } from '../../../core/models/api.models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionGroupDialogComponent } from '../question-group-dialog/question-group-dialog.component';

@Component({
   selector: 'app-exam-detail',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, QuestionGroupDialogComponent],
   template: `
      @if (isLoading) {
        <div class="flex items-center justify-center h-screen bg-gray-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600 font-medium">Loading exam details...</p>
          </div>
        </div>
      } @else if (error) {
        <div class="flex items-center justify-center h-screen bg-gray-50 p-6">
          <div class="bg-red-50 text-red-700 p-6 rounded-lg max-w-lg shadow-sm border border-red-100">
            <h3 class="text-lg font-bold mb-2">Error Loading Exam</h3>
            <p>{{ error }}</p>
            <button (click)="retryLoad()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Retry</button>
          </div>
        </div>
      } @else if (exam) {
      <div class="p-6 h-screen flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ exam.title }}</h1>
            <p class="text-sm text-gray-500">{{ exam.type }} &bull; {{ exam.status }}</p>
          </div>
          <div>
            <button class="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
          </div>
        </div>

        <!-- Main Layout -->
        <div class="flex flex-1 overflow-hidden space-x-6">
          
          <!-- Sidebar: Skills Navigation -->
          <div class="w-64 bg-white rounded-lg shadow-md overflow-y-auto">
            <div class="p-4 border-b bg-gray-50">
              <h3 class="font-semibold text-gray-700">Skills</h3>
            </div>
            <nav class="p-2">
              @for (skill of skills; track skill.id) {
              <button 
                      (click)="selectSkill(skill)"
                      [class.bg-blue-50]="selectedSkill?.id === skill.id"
                      class="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 mb-1 flex justify-between items-center group">
                <span class="font-medium text-gray-700">{{ skill.title }}</span>
                <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{{ skill.sections?.length || 0 }}</span>
              </button>
              }
              <button (click)="addSkill()" class="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 mt-2 border border-dashed border-blue-200 rounded">
                + Add Skill
              </button>
            </nav>
          </div>

          <!-- Content Area -->
          <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            
            <!-- Skill View -->
            @if (selectedSkill && !selectedSection) {
            <div class="p-6 overflow-y-auto">
              <h2 class="text-xl font-bold mb-4">{{ selectedSkill.title }} Sections</h2>
              
              <div class="space-y-4">
                @for (section of selectedSkill.sections || []; track section.id) {
                <div class="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                     (click)="selectedSection = section">
                  <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-lg">{{ section.title }}</h4>
                        @if (section.textContent) {
                        <p class="text-sm text-gray-500 line-clamp-2">{{ section.textContent }}</p>
                        }
                        <div class="flex items-center mt-2 space-x-2">
                          @if (section.audioUrl) {
                          <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Audio</span>
                          }
                          @if (section.imageUrl) {
                          <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Image</span>
                          }
                        </div>
                    </div>
                    <div class="text-gray-400">
                        {{ section.groups?.length || 0 }} Groups
                    </div>
                  </div>
                </div>
                }

                <!-- Add Section Box -->
                <div (click)="showCreateSectionModal = true" class="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                  <span class="text-2xl mb-2">+</span>
                  <span>Add New Section</span>
                </div>
              </div>
            </div>
            }

            <!-- Section Detail View (Questions) -->
            @if (selectedSection) {
            <div class="flex flex-col h-full">
              <div class="p-4 border-b flex items-center space-x-2">
                  <button (click)="selectedSection = null" class="text-gray-500 hover:text-gray-700">&larr; Back</button>
                  <h3 class="font-bold text-lg">{{ selectedSection.title }}</h3>
              </div>
              
              <div class="grid grid-cols-2 flex-1 overflow-hidden">
                  <!-- Left: Resource (Passage/Image) -->
                  <div class="p-6 border-r overflow-y-auto bg-gray-50">
                    @if (selectedSection.audioUrl) {
                    <div class="mb-4">
                        <div class="bg-black text-white p-2 rounded text-center text-xs">Audio Player Placeholder</div>
                    </div>
                    }
                    <div class="prose max-w-none">
                        @if (!selectedSection.textContent) {
                        <p class="text-gray-500 italic">No passage content. Click to edit.</p>
                        }
                        <div [innerHTML]="selectedSection.textContent"></div>
                    </div>
                  </div>

                  <!-- Right: Questions -->
                  <div class="p-6 overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-gray-700">Questions</h4>
                        <button (click)="showCreateGroupModal = true" class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                          + Add Group
                        </button>
                    </div>
                    
                    <!-- Groups List -->
                    <div class="space-y-6">
                        @for (group of selectedSection.groups || []; track $index) {
                        <div class="border rounded p-4">
                          <div class="font-semibold text-gray-800 mb-2">{{ group.title }} <span class="text-xs font-normal text-gray-500 ml-2">({{ group.instruction }})</span></div>
                          <div class="space-y-2">
                              @for (q of group.questions || []; track $index) {
                              <div class="flex items-start space-x-2 text-sm">
                                <div class="font-mono bg-gray-200 px-2 rounded">{{ q.orderIndex }}</div>
                                <div>{{ q.content || '[No Content]' }} <span class="text-red-600 font-bold ml-2">({{ q.correctAnswer }})</span></div>
                              </div>
                              }
                          </div>
                        </div>
                        } @empty {
                        <div class="text-center p-4 border border-dashed rounded text-gray-400">
                          No questions yet.
                        </div>
                        }
                    </div>
                  </div>
              </div>
            </div>
            }

            <!-- Empty State -->
            @if (!selectedSkill) {
            <div class="flex-1 flex items-center justify-center text-gray-400">
              Select a skill to view details
            </div>
            }
          </div>
        </div>
        
        <!-- Create Section Modal -->
        @if (showCreateSectionModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-1/2">
              <h3 class="text-xl font-bold mb-4">Add Section</h3>
              <form [formGroup]="sectionForm" (ngSubmit)="createSection()">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Title</label>
                    <input formControlName="title" class="w-full border rounded px-3 py-2">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Passage Content (HTML)</label>
                    <textarea formControlName="textContent" rows="5" class="w-full border rounded px-3 py-2"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" (click)="showCreateSectionModal = false" class="px-4 py-2 border rounded">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                </div>
              </form>
          </div>
        </div>
        }

        <!-- Create Group Modal -->
        @if (showCreateGroupModal) {
        <app-question-group-dialog 
                                  [sectionId]="selectedSection?.id || ''"
                                  (onCancel)="showCreateGroupModal = false"
                                  (onSave)="createGroup($event)">
        </app-question-group-dialog>
        }

      </div>
      }
   `,
})
export class ExamDetailComponent implements OnInit {
   exam: Exam | null = null;
   skills: ExamSkill[] = [];
   selectedSkill: ExamSkill | null = null;
   selectedSection: ExamSection | null = null;
   showCreateSectionModal = false;
   showCreateGroupModal = false;
   sectionForm: FormGroup;
   isLoading = false;
   error: string | null = null;
   private examId: string | null = null;

   constructor(
      private route: ActivatedRoute,
      private examsService: ExamsService,
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef
   ) {
      this.sectionForm = this.fb.group({
         title: ['', Validators.required],
         textContent: [''],
         orderIndex: [1]
      });
   }

   ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      console.log('[ExamDetail] ngOnInit, id =', id);
      if (id) {
         this.examId = id;
         this.loadExam(id);
      }
   }

   loadExam(id: string) {
      console.log('[ExamDetail] loadExam called, id =', id);
      this.isLoading = true;
      this.error = null;
      this.exam = null;

      this.examsService.getFullExam(id).subscribe({
         next: (res) => {
            console.log('[ExamDetail] API response received:', res);
            if (res) {
               // Normalize all arrays to prevent @for from crashing on undefined
               const skills = res.skills || [];
               skills.forEach(skill => {
                  skill.sections = skill.sections || [];
                  skill.sections.forEach(section => {
                     section.groups = section.groups || [];
                     section.groups.forEach(group => {
                        group.questions = group.questions || [];
                     });
                  });
               });

               this.exam = res;
               this.skills = skills;

               if (this.skills.length > 0) {
                  this.selectedSkill = this.skills[0];
               }
            }
            this.isLoading = false;
            console.log('[ExamDetail] isLoading set to false. exam =', this.exam?.title);
            this.cdr.detectChanges();
         },
         error: (err) => {
            console.error('[ExamDetail] API error:', err);
            this.error = 'Could not load the exam. Please check the console for details.';
            this.isLoading = false;
            this.cdr.detectChanges();
         }
      });
   }

   retryLoad() {
      if (this.examId) {
         this.error = null;
         this.loadExam(this.examId);
      }
   }

   selectSkill(skill: ExamSkill) {
      this.selectedSkill = skill;
      this.selectedSection = null;
   }

   addSkill() {
      alert("Add skill dialog would open here.");
   }

   createSection() {
      if (this.sectionForm.valid && this.selectedSkill) {
         const payload = this.sectionForm.value;

         if (!this.selectedSkill.sections) this.selectedSkill.sections = [];
         this.selectedSkill.sections.push({
            ...payload,
            id: 'temp-' + Date.now(),
            skillId: this.selectedSkill.id,
            groups: []
         });
         this.showCreateSectionModal = false;
      }
   }

   createGroup(groupData: any) {
      if (this.selectedSection) {
         if (!this.selectedSection.groups) this.selectedSection.groups = [];
         this.selectedSection.groups.push(groupData);
         this.showCreateGroupModal = false;
      }
   }
}
