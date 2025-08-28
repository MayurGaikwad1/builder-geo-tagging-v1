import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../services/location.service';
import { BranchService } from '../services/branch.service';
import { PartnerService } from '../services/partner.service';
import { ModalService } from '../services/modal.service';
import { LocationModalComponent } from './modals/location-modal.component';
import { PartnerMeetModalComponent } from './modals/partner-meet-modal.component';
import { AnalyticsModalComponent } from './modals/analytics-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LocationModalComponent, 
    PartnerMeetModalComponent, 
    AnalyticsModalComponent
  ],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <!-- Main Dashboard Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">Geo-Tagging Module Dashboard</h1>
          <p class="text-secondary-600 mt-2">Field operations management and monitoring</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Location Status -->
          <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" (click)="openLocationModal()">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-full" [class]="locationService.hasConsent() ? 'bg-success-100' : 'bg-error-100'">
                  <svg class="w-6 h-6" [class]="locationService.hasConsent() ? 'text-success-600' : 'text-error-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Location Tracking</p>
                <p class="text-2xl font-bold" [class]="locationService.hasConsent() ? 'text-success-600' : 'text-error-600'">
                  {{ locationService.hasConsent() ? 'Active' : 'Inactive' }}
                </p>
                <p class="text-xs text-secondary-500 mt-1">Click to manage</p>
              </div>
            </div>
          </div>

          <!-- Branch Activities -->
          <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" (click)="handleBranchActivity()">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 bg-primary-100 rounded-full">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Branch Activities</p>
                <p class="text-2xl font-bold text-primary-600">{{ getCompletedActivities() }}/3</p>
                <p class="text-xs text-secondary-500 mt-1">Activities completed today</p>
              </div>
            </div>
          </div>

          <!-- Partner Meetings -->
          <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" (click)="openPartnerMeetModal()">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 bg-accent-100 rounded-full">
                  <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Partner Meetings</p>
                <p class="text-2xl font-bold text-accent-600">{{ getTodayMeetings() }}</p>
                <p class="text-xs text-secondary-500 mt-1">Meetings today</p>
              </div>
            </div>
          </div>

          <!-- Analytics -->
          <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" (click)="openAnalyticsModal()">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 bg-warning-100 rounded-full">
                  <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">Analytics</p>
                <p class="text-2xl font-bold text-warning-600">View</p>
                <p class="text-xs text-secondary-500 mt-1">Reports & insights</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch Activity Tiles -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Today's Activities</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div *ngFor="let tile of branchService.tiles(); trackBy: trackByTile" 
                 class="tile" 
                 [class]="getTileClass(tile)"
                 (click)="handleTileClick(tile)"
                 [class.cursor-pointer]="tile.isEnabled"
                 [class.cursor-not-allowed]="!tile.isEnabled">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-secondary-900">{{ tile.name }}</h3>
                <span class="status-badge" [class]="getStatusBadgeClass(tile.status)">
                  {{ getStatusText(tile.status) }}
                </span>
              </div>
              <p class="text-sm text-secondary-600 mb-2">
                Time Window: {{ tile.timeWindow.start }} - {{ tile.timeWindow.end }}
              </p>
              <p class="text-xs text-secondary-500" *ngIf="tile.lastUpdated">
                Last updated: {{ tile.lastUpdated | date:'short' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Current Location Info -->
        <div class="mb-8" *ngIf="locationService.currentLocation()">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Current Location</h2>
          <div class="card p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm font-medium text-secondary-600 mb-1">Location</p>
                <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.location }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-secondary-600 mb-1">Timestamp</p>
                <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.dateTime | date:'medium' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-secondary-600 mb-1">Accuracy</p>
                <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.accuracy?.toFixed(1) }}m</p>
              </div>
            </div>
            <div class="mt-4 flex gap-3">
              <button (click)="captureLocation()" class="btn btn-primary">
                Capture Current Location
              </button>
              <button (click)="openLocationModal()" class="btn btn-secondary">
                View Location Details
              </button>
            </div>
          </div>
        </div>

        <!-- Request Location Consent -->
        <div class="mb-8" *ngIf="!locationService.hasConsent()">
          <div class="card p-6 bg-warning-50 border-warning-200">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-lg font-medium text-warning-800">Location Permission Required</h3>
                <p class="text-warning-700 mt-1">
                  To enable location tracking and branch activities, please grant location permission.
                </p>
                <div class="mt-4">
                  <button (click)="requestLocationConsent()" class="btn btn-warning">
                    Grant Location Permission
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Meeting -->
        <div class="mb-8" *ngIf="partnerService.activeMeeting()">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Active Meeting</h2>
          <div class="card p-6 bg-primary-50 border-primary-200">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-primary-900">{{ partnerService.activeMeeting()?.partnerName }}</h3>
                <p class="text-primary-700 mt-1">{{ partnerService.activeMeeting()?.purpose }}</p>
                <p class="text-sm text-primary-600 mt-2">
                  Started: {{ partnerService.activeMeeting()?.startDateTime | date:'medium' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-primary-600">{{ getMeetingDuration() }}</p>
                <p class="text-sm text-primary-600">Duration</p>
              </div>
            </div>
            <div class="mt-4 flex gap-3">
              <button (click)="openPartnerMeetModal()" class="btn btn-primary">
                Manage Meeting
              </button>
              <button (click)="completeMeeting()" class="btn btn-success">
                Complete Meeting
              </button>
            </div>
          </div>
        </div>

        <!-- Today's Meetings -->
        <div class="mb-8" *ngIf="getTodayMeetingsList().length > 0">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Today's Meetings</h2>
          <div class="space-y-4">
            <div 
              *ngFor="let meeting of getTodayMeetingsList(); trackBy: trackByMeeting" 
              class="card p-4 hover:bg-secondary-50 transition-colors cursor-pointer"
              (click)="openPartnerMeetModal()"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-semibold text-secondary-900">{{ meeting.partnerName }}</h4>
                    <span 
                      class="status-badge"
                      [class]="getStatusBadgeClass(meeting.status)"
                    >
                      {{ meeting.status }}
                    </span>
                  </div>
                  <p class="text-sm text-secondary-600 mb-1">{{ meeting.purpose }}</p>
                  <p class="text-sm text-secondary-500">{{ meeting.meetingDateTime | date:'short' }}</p>
                </div>
                <div class="text-right">
                  <button 
                    *ngIf="meeting.status === 'scheduled' && isToday(meeting.meetingDateTime)"
                    (click)="startMeeting(meeting); $event.stopPropagation()"
                    class="btn btn-primary btn-sm"
                  >
                    Start Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button (click)="openPartnerMeetModal()" class="quick-action-btn">
              <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Schedule Meeting
            </button>
            
            <button (click)="captureLocation()" class="quick-action-btn" [disabled]="!locationService.hasConsent()">
              <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              Capture Location
            </button>
            
            <button (click)="openAnalyticsModal()" class="quick-action-btn">
              <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              View Analytics
            </button>
            
            <button (click)="openLocationModal()" class="quick-action-btn">
              <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Location History
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Components -->
      <app-location-modal></app-location-modal>
      <app-partner-meet-modal></app-partner-meet-modal>
      <app-analytics-modal></app-analytics-modal>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-lg shadow-sm border border-secondary-200;
    }
    .tile {
      @apply bg-white rounded-lg shadow-sm border-2 border-secondary-200 p-4 transition-all duration-200;
    }
    .tile:hover {
      @apply shadow-md;
    }
    .tile-visible {
      @apply border-primary-300 bg-primary-50;
    }
    .tile-completed {
      @apply border-success-300 bg-success-50;
    }
    .tile-started {
      @apply border-warning-300 bg-warning-50;
    }
    .tile-incomplete {
      @apply border-red-300 bg-red-50;
    }
    .btn {
      @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
    }
    .btn-sm {
      @apply px-3 py-1.5 text-xs;
    }
    .btn-primary {
      @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
    }
    .btn-secondary {
      @apply text-secondary-700 bg-white border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500;
    }
    .btn-success {
      @apply text-white bg-success-600 hover:bg-success-700 focus:ring-success-500;
    }
    .btn-warning {
      @apply text-white bg-warning-600 hover:bg-warning-700 focus:ring-warning-500;
    }
    .btn:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
    .status-badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }
    .status-visible, .status-pending, .status-scheduled {
      @apply bg-warning-100 text-warning-800;
    }
    .status-completed {
      @apply bg-success-100 text-success-800;
    }
    .status-started, .status-in-progress {
      @apply bg-primary-100 text-primary-800;
    }
    .status-incomplete {
      @apply bg-red-100 text-red-800;
    }
    .quick-action-btn {
      @apply flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-secondary-200 hover:bg-secondary-50 hover:shadow-md transition-all duration-200 text-secondary-700 hover:text-primary-600;
    }
    .quick-action-btn:disabled {
      @apply opacity-50 cursor-not-allowed hover:bg-white hover:text-secondary-700;
    }
  `]
})
export class DashboardComponent implements OnInit {
  locationService = inject(LocationService);
  branchService = inject(BranchService);
  partnerService = inject(PartnerService);
  modalService = inject(ModalService);

  ngOnInit() {
    // Auto-request location consent if not already granted
    if (!this.locationService.hasConsent()) {
      setTimeout(() => {
        this.requestLocationConsent();
      }, 1000);
    }
  }

  // Modal opening methods
  openLocationModal() {
    this.modalService.openModal('location');
  }

  openPartnerMeetModal() {
    this.modalService.openModal('partner-meet');
  }

  openAnalyticsModal() {
    this.modalService.openModal('analytics');
  }

  // Location methods
  async requestLocationConsent() {
    await this.locationService.requestLocationConsent();
  }

  async captureLocation() {
    await this.locationService.manualLocationCapture();
  }

  // Branch activity methods
  getCompletedActivities(): number {
    const tiles = this.branchService.tiles();
    return tiles.filter(tile => tile.status === 'completed').length;
  }

  handleBranchActivity() {
    // Just highlight available actions - no modal needed for branch activities
    const tiles = this.branchService.tiles();
    const availableTile = tiles.find(tile => tile.isVisible && tile.isEnabled);
    if (availableTile) {
      this.handleTileClick(availableTile);
    }
  }

  getTileClass(tile: any): string {
    const baseClass = 'tile';
    switch (tile.status) {
      case 'completed':
        return `${baseClass} tile-completed`;
      case 'started':
        return `${baseClass} tile-started`;
      case 'incomplete':
        return `${baseClass} tile-incomplete`;
      case 'visible':
        return `${baseClass} tile-visible`;
      default:
        return baseClass;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'started':
      case 'in-progress':
        return 'status-started';
      case 'incomplete':
        return 'status-incomplete';
      case 'scheduled':
        return 'status-scheduled';
      default:
        return 'status-visible';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'started':
        return 'Started';
      case 'incomplete':
        return 'Incomplete';
      case 'visible':
        return 'Pending';
      default:
        return status;
    }
  }

  async handleTileClick(tile: any) {
    if (!tile.isEnabled) return;

    switch (tile.id) {
      case 'branch-checkin':
        const checkInResult = await this.branchService.performBranchCheckIn();
        alert(checkInResult.message);
        break;
      case 'morning-huddle':
        const huddleResult = await this.branchService.performMorningHuddle();
        alert(huddleResult.message);
        break;
      case 'day-closure':
        const closureResult = await this.branchService.performDayClosure();
        alert(closureResult.message);
        break;
    }
  }

  // Partner meeting methods
  getTodayMeetings(): number {
    return this.partnerService.getTodayMeetings().length;
  }

  getTodayMeetingsList() {
    return this.partnerService.getTodayMeetings().slice(0, 3); // Show only first 3
  }

  getMeetingDuration(): string {
    const activeMeeting = this.partnerService.activeMeeting();
    if (!activeMeeting?.startDateTime) return '00:00';
    
    const now = new Date();
    const start = new Date(activeMeeting.startDateTime);
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  async startMeeting(meeting: any) {
    const meetingCode = meeting.meetingCode ? 
      prompt('Enter meeting code:') : undefined;
    
    const result = await this.partnerService.startMeeting(meeting.meetingId, meetingCode || undefined);
    
    if (result.success) {
      alert('Meeting started successfully!');
    } else {
      alert(`Failed to start meeting: ${result.message}`);
    }
  }

  async completeMeeting() {
    const activeMeeting = this.partnerService.activeMeeting();
    if (activeMeeting) {
      const result = await this.partnerService.completeMeeting(activeMeeting.meetingId);
      if (result.success) {
        alert('Meeting completed successfully!');
      } else {
        alert(`Failed to complete meeting: ${result.message}`);
      }
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const meetingDate = new Date(date);
    return today.toDateString() === meetingDate.toDateString();
  }

  // Track by functions
  trackByTile(index: number, tile: any): string {
    return tile.id;
  }

  trackByMeeting(index: number, meeting: any): string {
    return meeting.meetingId;
  }
}
