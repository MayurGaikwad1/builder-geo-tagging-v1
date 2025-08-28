import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, LocationData } from '../services/location.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">Location Tracking</h1>
          <p class="text-secondary-600 mt-2">Monitor and manage your location tracking data</p>
        </div>

        <!-- Current Status -->
        <div class="card p-6 mb-8">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">Current Status</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div [class]="trackingStatusClass()" class="mx-auto mb-2"></div>
              <h3 class="font-medium text-secondary-900">Tracking Status</h3>
              <p class="text-sm text-secondary-600">{{ trackingStatusText() }}</p>
            </div>
            
            <div class="text-center">
              <div [class]="gpsStatusClass()" class="mx-auto mb-2"></div>
              <h3 class="font-medium text-secondary-900">GPS Status</h3>
              <p class="text-sm text-secondary-600">{{ gpsStatusText() }}</p>
            </div>
            
            <div class="text-center">
              <div [class]="consentStatusClass()" class="mx-auto mb-2"></div>
              <h3 class="font-medium text-secondary-900">Consent Status</h3>
              <p class="text-sm text-secondary-600">{{ consentStatusText() }}</p>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-secondary-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-medium text-secondary-900">Current Location</h3>
                <p class="text-sm text-secondary-600">{{ currentLocationText() }}</p>
                <p class="text-xs text-secondary-400">Last updated: {{ lastUpdateText() }}</p>
              </div>
              <div class="mt-4 sm:mt-0">
                <button 
                  (click)="captureLocation()"
                  [disabled]="!canCaptureLocation()"
                  class="btn btn-primary"
                >
                  Capture Current Location
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Consent Management -->
        <div class="card p-6 mb-8" *ngIf="!hasConsent()">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-warning-800">Location Consent Required</h3>
              <div class="mt-2 text-sm text-warning-700">
                <p>To enable location tracking, we need your permission to access your device's location. This helps us:</p>
                <ul class="mt-2 list-disc list-inside">
                  <li>Track your presence at branch locations</li>
                  <li>Automate check-ins and daily activities</li>
                  <li>Verify partner meeting locations</li>
                  <li>Provide accurate reporting and analytics</li>
                </ul>
              </div>
              <div class="mt-4">
                <button 
                  (click)="requestConsent()"
                  class="btn btn-warning mr-3"
                >
                  Grant Location Permission
                </button>
                <button 
                  (click)="showPrivacyInfo()"
                  class="btn btn-secondary"
                >
                  Privacy Information
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Consent Management for existing consent -->
        <div class="card p-6 mb-8" *ngIf="hasConsent()">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-secondary-900">Location Consent</h3>
              <p class="text-sm text-secondary-600">You have granted permission for location tracking</p>
              <p class="text-xs text-secondary-400">Granted on: {{ consentDate() }}</p>
            </div>
            <button 
              (click)="revokeConsent()"
              class="btn btn-danger"
            >
              Revoke Consent
            </button>
          </div>
        </div>

        <!-- Location History -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-secondary-900">Location History</h2>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-secondary-600">{{ locationHistory().length }} records</span>
              <button 
                (click)="refreshHistory()"
                class="btn btn-secondary btn-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <div *ngIf="locationHistory().length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-secondary-900">No location data</h3>
            <p class="mt-1 text-sm text-secondary-500">Start location tracking to see your history here.</p>
          </div>

          <div *ngIf="locationHistory().length > 0" class="overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-secondary-200">
                <thead class="bg-secondary-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Date & Time</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Coordinates</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Accuracy</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-secondary-200">
                  <tr *ngFor="let location of locationHistory(); trackBy: trackByLocationId" class="hover:bg-secondary-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {{ formatDateTime(location.dateTime) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-secondary-900">
                      {{ location.location }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 font-mono">
                      {{ formatCoordinates(location.latitude, location.longitude) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {{ formatAccuracy(location.accuracy) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getLocationTypeClass(location.userInitiated)">
                        {{ location.userInitiated ? 'Manual' : 'Auto' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationComponent implements OnInit {
  hasConsent = signal(false);
  isTracking = signal(false);
  isGpsEnabled = signal(false);
  currentLocation = signal<LocationData | null>(null);
  locationHistory = signal<LocationData[]>([]);
  consentDate = signal('');

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadLocationData();
    this.refreshHistory();
  }

  private loadLocationData() {
    this.hasConsent.set(this.locationService.hasConsent());
    this.isTracking.set(this.locationService.isTracking());
    this.isGpsEnabled.set(this.locationService.isGpsEnabled());
    this.currentLocation.set(this.locationService.currentLocation());

    const storedConsent = localStorage.getItem('locationConsent');
    if (storedConsent) {
      const consent = JSON.parse(storedConsent);
      this.consentDate.set(new Date(consent.timestamp).toLocaleDateString());
    }
  }

  async requestConsent() {
    // Check if location is supported
    const permissionStatus = await this.locationService.checkLocationPermission();

    if (!permissionStatus.supported) {
      alert('Location services are not supported by your browser. Please use a modern browser with location support.');
      return;
    }

    const granted = await this.locationService.requestLocationConsent();
    this.loadLocationData();
    if (granted) {
      this.refreshHistory();
    }
  }

  revokeConsent() {
    if (confirm('Are you sure you want to revoke location consent? This will stop all location tracking.')) {
      this.locationService.revokeConsent();
      this.loadLocationData();
    }
  }

  async captureLocation() {
    try {
      const location = await this.locationService.manualLocationCapture();
      if (location) {
        this.currentLocation.set(location);
        this.refreshHistory();
        console.log('Location captured successfully:', location);
      }
    } catch (error) {
      console.error('Failed to capture location:', error);
      // The location service will handle showing the error message
    }
  }

  refreshHistory() {
    this.locationHistory.set(this.locationService.getLocationHistory());
  }

  showPrivacyInfo() {
    alert('Privacy Information:\n\n• Location data is stored locally on your device\n• Data is encrypted and secure\n• Used only for business purposes\n• Retained for 3 years as per policy\n• You can revoke consent at any time');
  }

  // Status indicator classes and text
  trackingStatusClass(): string {
    const baseClass = 'h-12 w-12 rounded-full flex items-center justify-center';
    if (this.isTracking()) {
      return `${baseClass} bg-success-100 text-success-600`;
    }
    return `${baseClass} bg-danger-100 text-danger-600`;
  }

  trackingStatusText(): string {
    return this.isTracking() ? 'Active' : 'Inactive';
  }

  gpsStatusClass(): string {
    const baseClass = 'h-12 w-12 rounded-full flex items-center justify-center';
    if (this.isGpsEnabled()) {
      return `${baseClass} bg-success-100 text-success-600`;
    }
    return `${baseClass} bg-warning-100 text-warning-600`;
  }

  gpsStatusText(): string {
    return this.isGpsEnabled() ? 'Enabled' : 'Disabled';
  }

  consentStatusClass(): string {
    const baseClass = 'h-12 w-12 rounded-full flex items-center justify-center';
    if (this.hasConsent()) {
      return `${baseClass} bg-success-100 text-success-600`;
    }
    return `${baseClass} bg-secondary-100 text-secondary-600`;
  }

  consentStatusText(): string {
    return this.hasConsent() ? 'Granted' : 'Required';
  }

  currentLocationText(): string {
    const location = this.currentLocation();
    return location ? location.location : 'Location not available';
  }

  lastUpdateText(): string {
    const location = this.currentLocation();
    return location ? new Date(location.dateTime).toLocaleString() : 'Never';
  }

  canCaptureLocation(): boolean {
    return this.hasConsent() && this.isGpsEnabled();
  }

  // Table formatting methods
  formatDateTime(dateTime: Date): string {
    return new Date(dateTime).toLocaleString();
  }

  formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  formatAccuracy(accuracy: number): string {
    return `${Math.round(accuracy)}m`;
  }

  getLocationTypeClass(userInitiated: boolean): string {
    return userInitiated 
      ? 'status-badge status-info'
      : 'status-badge status-success';
  }

  trackByLocationId(index: number, location: LocationData): string {
    return `${location.dateTime.toString()}_${location.latitude}_${location.longitude}`;
  }
}
