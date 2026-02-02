import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamsService } from '../../../core/services/exams.service';
import { ExamListDto, PagedList } from '../../../core/models/api.models';

type SortField = 'title' | 'type' | 'status' | 'duration';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage and organize IELTS exams</p>
        </div>
        <div class="flex items-center space-x-3">
          <a 
            routerLink="/admin/import" 
            class="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import JSON
          </a>
          <a 
            routerLink="/admin/create" 
            class="inline-flex items-center px-4 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Exam
          </a>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-xl shadow-md p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Search Bar -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="Search exams by title or slug..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="flex items-center space-x-3">
            <select 
              [(ngModel)]="filterStatus"
              (change)="onFilterChange()"
              class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <select 
              [(ngModel)]="filterType"
              (change)="onFilterChange()"
              class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Types</option>
              <option value="IeltsAcademic">IELTS Academic</option>
              <option value="IeltsGeneral">IELTS General</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left">
                  <button 
                    (click)="toggleSort('title')"
                    class="group inline-flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    Title
                    <span class="ml-2 flex-none rounded">
                      @if (sortField() === 'title') {
                        <svg class="w-4 h-4 {{ sortDirection() === 'asc' ? '' : 'rotate-180' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      }
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <button 
                    (click)="toggleSort('type')"
                    class="group inline-flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    Type
                    <span class="ml-2">
                      @if (sortField() === 'type') {
                        <svg class="w-4 h-4 {{ sortDirection() === 'asc' ? '' : 'rotate-180' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      }
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <button 
                    (click)="toggleSort('status')"
                    class="group inline-flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    Status
                    <span class="ml-2">
                      @if (sortField() === 'status') {
                        <svg class="w-4 h-4 {{ sortDirection() === 'asc' ? '' : 'rotate-180' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      }
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <button 
                    (click)="toggleSort('duration')"
                    class="group inline-flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    Duration
                    <span class="ml-2">
                      @if (sortField() === 'duration') {
                        <svg class="w-4 h-4 {{ sortDirection() === 'asc' ? '' : 'rotate-180' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      }
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (isLoading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="5" class="px-6 py-4">
                      <div class="flex items-center space-x-4">
                        <div class="skeleton h-4 w-1/3"></div>
                        <div class="skeleton h-4 w-1/4"></div>
                      </div>
                    </td>
                  </tr>
                }
              } @else if (exams()?.items && exams()!.items.length > 0) {
                @for (exam of exams()!.items; track exam.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-semibold text-gray-900">{{ exam.title }}</div>
                          <div class="text-sm text-gray-500">{{ exam.slug }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {{ exam.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': exam.status === 'Published',
                          'bg-yellow-100 text-yellow-800': exam.status === 'Draft',
                          'bg-gray-100 text-gray-800': exam.status === 'Archived'
                        }">
                        {{ exam.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center text-sm text-gray-900">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ exam.duration }} mins
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <a 
                          [routerLink]="['/admin/exams', exam.id]" 
                          class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </a>
                        <button 
                          (click)="exam.id && deleteExam(exam.id)" 
                          [disabled]="!exam.id" 
                          class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by creating a new exam or importing from JSON.</p>
                    <div class="mt-6 flex items-center justify-center space-x-3">
                      <a routerLink="/admin/create" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Exam
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (exams()?.items && exams()!.items.length > 0) {
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-700">
                  Showing <span class="font-medium">{{ getStartItem() }}</span> to 
                  <span class="font-medium">{{ getEndItem() }}</span> of 
                  <span class="font-medium">{{ exams()?.totalCount || 0 }}</span> results
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <button 
                  (click)="previousPage()"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div class="flex items-center space-x-1">
                  @for (page of getPageNumbers(); track page) {
                    <button 
                      (click)="goToPage(page)"
                      [class.bg-blue-600]="currentPage() === page"
                      [class.text-white]="currentPage() === page"
                      [class.bg-white]="currentPage() !== page"
                      [class.text-gray-700]="currentPage() !== page"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                    >
                      {{ page }}
                    </button>
                  }
                </div>
                
                <button 
                  (click)="nextPage()"
                  [disabled]="currentPage() === getTotalPages()"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>

                <select 
                  [(ngModel)]="pageSize"
                  (change)="onPageSizeChange()"
                  class="ml-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option [value]="10">10 per page</option>
                  <option [value]="25">25 per page</option>
                  <option [value]="50">50 per page</option>
                  <option [value]="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ExamListComponent implements OnInit {
  protected readonly exams = signal<PagedList<ExamListDto> | null>(null);
  protected isLoading = signal(true);
  protected searchTerm = '';
  protected filterStatus = '';
  protected filterType = '';
  protected currentPage = signal(1);
  protected pageSize = 10;
  protected sortField = signal<SortField>('title');
  protected sortDirection = signal<SortDirection>('asc');

  constructor(private examsService: ExamsService) { }

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.isLoading.set(true);
    this.examsService.getExams({
      page: this.currentPage(),
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.exams.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    // In real app, debounce this and filter on backend
    this.currentPage.set(1);
    this.loadExams();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadExams();
  }

  toggleSort(field: SortField) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadExams();
  }

  deleteExam(id: string) {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examsService.deleteExam(id).subscribe(() => {
        this.loadExams();
      });
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadExams();
    }
  }

  nextPage() {
    if (this.currentPage() < this.getTotalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadExams();
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadExams();
  }

  onPageSizeChange() {
    this.currentPage.set(1);
    this.loadExams();
  }

  getTotalPages(): number {
    const total = this.exams()?.totalCount || 0;
    return Math.ceil(total / this.pageSize);
  }

  getStartItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  getEndItem(): number {
    const end = this.currentPage() * this.pageSize;
    const total = this.exams()?.totalCount || 0;
    return Math.min(end, total);
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const current = this.currentPage();
    const delta = 2;
    const range = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < total - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  }
}
