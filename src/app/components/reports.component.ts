import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">Reports & Analytics</h1>
          <p class="text-secondary-600 mt-2">View comprehensive reports and analytics for field operations</p>
        </div>

        <!-- Coming Soon Card -->
        <div class="card p-8 text-center">
          <div class="mx-auto h-12 w-12 bg-accent-100 rounded-full flex items-center justify-center mb-4">
            <svg class="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-secondary-900 mb-2">Analytics Dashboard</h2>
          <p class="text-secondary-600 mb-6">Comprehensive reporting and data visualization for field operations</p>
          
          <div class="bg-secondary-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-medium text-secondary-900 mb-4">Available Reports:</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Location Tracking</h4>
                  <p class="text-sm text-secondary-600">Daily/weekly location history reports</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Branch Activities</h4>
                  <p class="text-sm text-secondary-600">Check-in, huddle, and closure reports</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Partner Meetings</h4>
                  <p class="text-sm text-secondary-600">Meeting completion and duration analytics</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Compliance Reports</h4>
                  <p class="text-sm text-secondary-600">Adherence to policies and procedures</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Performance Metrics</h4>
                  <p class="text-sm text-secondary-600">KPIs and performance indicators</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Export Options</h4>
                  <p class="text-sm text-secondary-600">PDF, Excel, and CSV exports</p>
                </div>
              </div>
            </div>
          </div>

          <p class="text-sm text-secondary-500">
            Continue prompting to have me implement detailed analytics dashboards, charts, and export functionality as specified in your requirements.
          </p>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {}
