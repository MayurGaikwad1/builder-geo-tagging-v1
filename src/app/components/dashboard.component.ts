import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocationService } from '../services/location.service';
import { BranchService } from '../services/branch.service';
import { PartnerService } from '../services/partner.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <!-- Header Section -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
                Field Operations Dashboard
              </h1>
              <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div class="mt-2 flex items-center text-sm text-secondary-500">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ currentDate() }}
                </div>
                <div class="mt-2 flex items-center text-sm text-secondary-500">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ currentLocation() || 'Location unavailable' }}
                </div>
              </div>
            </div>
            
            <!-- Location Consent Section -->
            <div class="mt-4 md:mt-0 md:ml-4">
              <div *ngIf="!hasLocationConsent()" class="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-warning-800">Location Access Required</h3>
                    <div class="mt-2">
                      <button 
                        (click)="requestLocationConsent()"
                        class="btn btn-warning text-xs"
                      >
                        Grant Permission
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Location Status Card -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div [class]="locationStatusIndicatorClass()"></div>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-lg font-medium text-secondary-900">Location Tracking</h3>
                <p class="text-sm text-secondary-500">{{ locationStatusText() }}</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="text-sm text-secondary-600">
                Last updated: {{ lastLocationUpdate() }}
              </div>
            </div>
          </div>

          <!-- Branch Status Card -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-lg font-medium text-secondary-900">Assigned Branch</h3>
                <p class="text-sm text-secondary-500">{{ assignedBranchName() }}</p>
              </div>
            </div>
            <div class="mt-4">
              <span [class]="branchProximityClass()">
                {{ branchProximityText() }}
              </span>
            </div>
          </div>

          <!-- Today's Meetings Card -->
          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-lg font-medium text-secondary-900">Today's Meetings</h3>
                <p class="text-sm text-secondary-500">{{ todayMeetingsCount() }} scheduled</p>
              </div>
            </div>
            <div class="mt-4">
              <button 
                routerLink="/partner-meet"
                class="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all meetings →
              </button>
            </div>
          </div>
        </div>

        <!-- Daily Activities Tiles -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">Daily Activities</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              *ngFor="let tile of dailyTiles()" 
              [class]="getTileClass(tile)"
              (click)="onTileClick(tile)"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-secondary-900">{{ tile.name }}</h3>
                <span [class]="getTileStatusClass(tile)">
                  {{ getTileStatusText(tile) }}
                </span>
              </div>
              
              <div class="text-sm text-secondary-600 mb-3">
                Time Window: {{ tile.timeWindow.start }} - {{ tile.timeWindow.end }}
              </div>
              
              <div class="flex items-center justify-between">
                <div class="text-xs text-secondary-500">
                  {{ getTileTimeInfo(tile) }}
                </div>
                <div *ngIf="tile.isEnabled" class="text-primary-600">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              routerLink="/partner-meet"
              class="card card-hover p-4 text-left"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-secondary-900">New Partner Meet</h3>
                  <p class="text-xs text-secondary-500">Schedule a meeting</p>
                </div>
              </div>
            </button>

            <button 
              (click)="captureManualLocation()"
              class="card card-hover p-4 text-left"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-secondary-900">Capture Location</h3>
                  <p class="text-xs text-secondary-500">Manual location update</p>
                </div>
              </div>
            </button>

            <button 
              routerLink="/location"
              class="card card-hover p-4 text-left"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-secondary-900">Location History</h3>
                  <p class="text-xs text-secondary-500">View tracking data</p>
                </div>
              </div>
            </button>

            <button 
              routerLink="/reports"
              class="card card-hover p-4 text-left"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-secondary-900">Reports</h3>
                  <p class="text-xs text-secondary-500">View analytics</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentDate = signal('');
  currentLocation = signal('');
  hasLocationConsent = signal(false);
  assignedBranchName = signal('');
  todayMeetingsCount = signal(0);
  dailyTiles = signal<any[]>([]);
  lastLocationUpdate = signal('Never');

  constructor(
    private locationService: LocationService,
    private branchService: BranchService,
    private partnerService: PartnerService
  ) {}

  ngOnInit() {
    this.updateCurrentDate();
    this.loadLocationData();
    this.loadBranchData();
    this.loadMeetingData();
    this.loadTileData();

    // Set up real-time updates
    setInterval(() => {
      this.updateCurrentDate();
    }, 60000); // Update every minute
  }

  private updateCurrentDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.currentDate.set(now.toLocaleDateString('en-US', options));
  }

  private loadLocationData() {
    this.hasLocationConsent.set(this.locationService.hasConsent());
    
    const current = this.locationService.currentLocation();
    if (current) {
      this.currentLocation.set(current.location);
      this.lastLocationUpdate.set(new Date(current.dateTime).toLocaleTimeString());
    }
  }

  private loadBranchData() {
    const branch = this.branchService.assignedBranch();
    if (branch) {
      this.assignedBranchName.set(branch.name);
    }
  }

  private loadMeetingData() {
    const todayMeetings = this.partnerService.getTodayMeetings();
    this.todayMeetingsCount.set(todayMeetings.length);
  }

  private loadTileData() {
    this.dailyTiles.set(this.branchService.tiles());
  }

  async requestLocationConsent() {
    // Check permission status first
    const permissionStatus = await this.locationService.checkLocationPermission();

    if (!permissionStatus.supported) {
      alert('Location services are not supported by your browser. Please use a modern browser with location support.');
      return;
    }

    if (permissionStatus.permission === 'denied') {
      alert('Location access has been denied. Please:\n1. Click the location icon in your browser address bar\n2. Select "Allow" for location permissions\n3. Refresh the page and try again');
      return;
    }

    const granted = await this.locationService.requestLocationConsent();
    this.hasLocationConsent.set(granted);
    if (granted) {
      this.loadLocationData();
    } else {
      // Permission was not granted, show helpful message
      console.log('Location permission not granted');
    }
  }

  async captureManualLocation() {
    const location = await this.locationService.manualLocationCapture();
    if (location) {
      this.currentLocation.set(location.location);
      this.lastLocationUpdate.set(new Date().toLocaleTimeString());
    }
  }

  locationStatusIndicatorClass(): string {
    if (!this.hasLocationConsent()) {
      return 'h-8 w-8 bg-secondary-100 rounded-full flex items-center justify-center';
    }
    
    if (this.locationService.isTracking()) {
      return 'h-8 w-8 bg-success-100 rounded-full flex items-center justify-center';
    }
    
    return 'h-8 w-8 bg-danger-100 rounded-full flex items-center justify-center';
  }

  locationStatusText(): string {
    if (!this.hasLocationConsent()) {
      return 'Location consent required';
    }
    
    if (this.locationService.isTracking()) {
      return 'Active tracking';
    }
    
    return 'Tracking inactive';
  }

  branchProximityClass(): string {
    // Check if near branch (mock logic)
    return 'status-badge status-info';
  }

  branchProximityText(): string {
    return 'Near branch';
  }

  getTileClass(tile: any): string {
    let baseClass = 'tile';
    
    if (!tile.isEnabled) {
      baseClass += ' tile-disabled';
    }
    
    if (tile.status === 'completed') {
      baseClass += ' border-success-200 bg-success-50';
    } else if (tile.isVisible) {
      baseClass += ' border-primary-200 bg-primary-50';
    }
    
    return baseClass;
  }

  getTileStatusClass(tile: any): string {
    switch (tile.status) {
      case 'completed':
        return 'status-badge status-success';
      case 'started':
        return 'status-badge status-info';
      case 'incomplete':
        return 'status-badge status-danger';
      default:
        return 'status-badge status-warning';
    }
  }

  getTileStatusText(tile: any): string {
    switch (tile.status) {
      case 'completed':
        return 'Completed';
      case 'started':
        return 'In Progress';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'Pending';
    }
  }

  getTileTimeInfo(tile: any): string {
    if (tile.completedAt) {
      return `Completed at ${new Date(tile.completedAt).toLocaleTimeString()}`;
    }
    if (tile.lastUpdated) {
      return `Last updated ${new Date(tile.lastUpdated).toLocaleTimeString()}`;
    }
    return 'Not started';
  }

  async onTileClick(tile: any) {
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
    
    // Refresh tile data
    this.loadTileData();
  }
}
