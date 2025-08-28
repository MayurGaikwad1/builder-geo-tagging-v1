import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner-meet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">Partner Meet (Customer 360)</h1>
          <p class="text-secondary-600 mt-2">Schedule and manage partner meetings with geo-validation</p>
        </div>

        <!-- Coming Soon Card -->
        <div class="card p-8 text-center">
          <div class="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-secondary-900 mb-2">Partner Meet Module</h2>
          <p class="text-secondary-600 mb-6">Complete partner meeting management with geo-validation and selfie capture</p>
          
          <div class="bg-secondary-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-medium text-secondary-900 mb-4">Features Coming Soon:</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Meeting Scheduling</h4>
                  <p class="text-sm text-secondary-600">Create meetings with existing/new partners</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Geo-Validation</h4>
                  <p class="text-sm text-secondary-600">Location verification for meetings</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Selfie Capture</h4>
                  <p class="text-sm text-secondary-600">Photo verification with metadata</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Meeting Codes</h4>
                  <p class="text-sm text-secondary-600">Verification codes for new partners</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">PMACS Integration</h4>
                  <p class="text-sm text-secondary-600">Partner data synchronization</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg class="h-5 w-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <h4 class="font-medium text-secondary-900">Meeting Analytics</h4>
                  <p class="text-sm text-secondary-600">Duration and completion tracking</p>
                </div>
              </div>
            </div>
          </div>

          <p class="text-sm text-secondary-500">
            Continue prompting to have me implement this module in detail, including forms, validation, and all the features specified in your requirements.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PartnerMeetComponent {}
