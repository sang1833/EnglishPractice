import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  examTitle: string;
  studentName: string;
  score: number;
  status: 'completed' | 'in-progress' | 'pending';
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl p-8 text-white">
        <h1 class="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
        <p class="text-blue-100">Here's what's happening with your IELTS platform today.</p>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (metric of metrics(); track metric.title) {
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 mb-1">{{ metric.title }}</p>
                  <p class="text-3xl font-bold text-gray-900 mb-2">{{ metric.value }}</p>
                  <div class="flex items-center">
                    @if (metric.trend === 'up') {
                      <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span class="text-sm font-medium text-green-600">{{ metric.change }}</span>
                    } @else {
                      <svg class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span class="text-sm font-medium text-red-600">{{ metric.change }}</span>
                    }
                    <span class="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br {{ metric.color }} transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div [innerHTML]="metric.icon" class="w-7 h-7 text-white"></div>
                </div>
              </div>
            </div>
            <div class="h-1 bg-gradient-to-r {{ metric.color }}"></div>
          </div>
        }
      </div>

      <!-- Charts & Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Exam Submissions Chart -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Exam Submissions</h3>
            <select class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          
          <!-- Chart Placeholder -->
          <div class="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
            <div class="text-center">
              <svg class="w-16 h-16 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="text-sm font-medium text-gray-600">Line Chart</p>
              <p class="text-xs text-gray-500">Submissions trend visualization</p>
            </div>
          </div>
        </div>

        <!-- Exam Type Distribution -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Exam Type Distribution</h3>
          </div>
          
          <!-- Donut Chart Placeholder -->
          <div class="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
            <div class="text-center">
              <svg class="w-16 h-16 text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p class="text-sm font-medium text-gray-600">Donut Chart</p>
              <p class="text-xs text-gray-500">Academic vs General distribution</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity Table -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <a routerLink="/admin/exams" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </a>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (activity of recentActivities(); track activity.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {{ activity.studentName.charAt(0) }}
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900">{{ activity.studentName }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-gray-900">{{ activity.examTitle }}</p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-semibold text-gray-900">{{ activity.score }}/9.0</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (activity.status === 'completed') {
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      } @else if (activity.status === 'in-progress') {
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                      } @else {
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Pending
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ activity.timestamp }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div class="space-y-3">
            <a routerLink="/admin/create" class="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Create New Exam</p>
                <p class="text-xs text-gray-600">Start from scratch</p>
              </div>
            </a>

            <a routerLink="/admin/import" class="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group">
              <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Import JSON</p>
                <p class="text-xs text-gray-600">Upload exam file</p>
              </div>
            </a>

            <a routerLink="/admin/exams" class="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group">
              <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Manage Exams</p>
                <p class="text-xs text-gray-600">View all exams</p>
              </div>
            </a>

            <button class="w-full flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all group">
              <div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center  justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-medium text-gray-900">View Reports</p>
                <p class="text-xs text-gray-600">Analytics & insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  protected readonly metrics = signal<MetricCard[]>([
    {
      title: 'Total Exams',
      value: 124,
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
    },
    {
      title: 'Total Students',
      value: '2,543',
      change: '+18%',
      trend: 'up',
      color: 'from-green-500 to-green-600',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
    },
    {
      title: 'Avg. Score',
      value: '7.2',
      change: '+0.3',
      trend: 'up',
      color: 'from-purple-500 to-purple-600',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>'
    },
    {
      title: 'Completion Rate',
      value: '89%',
      change: '-2%',
      trend: 'down',
      color: 'from-orange-500 to-orange-600',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
    }
  ]);

  protected readonly recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      examTitle: 'IELTS Academic Test #45',
      studentName: 'John Smith',
      score: 7.5,
      status: 'completed',
      timestamp: '5 min ago'
    },
    {
      id: '2',
      examTitle: 'IELTS General Test #22',
      studentName: 'Sarah Johnson',
      score: 8.0,
      status: 'completed',
      timestamp: '12 min ago'
    },
    {
      id: '3',
      examTitle: 'IELTS Academic Test #46',
      studentName: 'Michael Chen',
      score: 6.5,
      status: 'in-progress',
      timestamp: '25 min ago'
    },
    {
      id: '4',
      examTitle: 'IELTS General Test #23',
      studentName: 'Emma Wilson',
      score: 7.0,
      status: 'completed',
      timestamp: '1 hour ago'
    },
    {
      id: '5',
      examTitle: 'IELTS Academic Test #47',
      studentName: 'David Lee',
      score: 0,
      status: 'pending',
      timestamp: '2 hours ago'
    }
  ]);
}
