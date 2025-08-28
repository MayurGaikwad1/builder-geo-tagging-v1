import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, LocationData } from '../../services/location.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" [class.hidden]="!modalService.isModalOpen('location')">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-white px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">Location Tracking</h3>
              <button
                (click)="closeModal()"
                class="text-secondary-400 hover:text-secondary-500 focus:outline-none focus:text-secondary-500 transition ease-in-out duration-150"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            <!-- Location Status -->
            <div class="mb-8">
              <h4 class="text-lg font-semibold text-secondary-900 mb-4">Current Status</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Location Consent -->
                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="p-2 rounded-full" [class]="locationService.hasConsent() ? 'bg-success-100' : 'bg-error-100'">
                        <svg class="w-5 h-5" [class]="locationService.hasConsent() ? 'text-success-600' : 'text-error-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Location Consent</p>
                      <p class="text-lg font-semibold" [class]="locationService.hasConsent() ? 'text-success-600' : 'text-error-600'">
                        {{ locationService.hasConsent() ? 'Granted' : 'Required' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- GPS Status -->
                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="p-2 rounded-full" [class]="locationService.isGpsEnabled() ? 'bg-primary-100' : 'bg-warning-100'">
                        <svg class="w-5 h-5" [class]="locationService.isGpsEnabled() ? 'text-primary-600' : 'text-warning-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">GPS Status</p>
                      <p class="text-lg font-semibold" [class]="locationService.isGpsEnabled() ? 'text-primary-600' : 'text-warning-600'">
                        {{ locationService.isGpsEnabled() ? 'Active' : 'Inactive' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Tracking Status -->
                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="p-2 rounded-full" [class]="locationService.isTracking() ? 'bg-accent-100' : 'bg-secondary-100'">
                        <svg class="w-5 h-5" [class]="locationService.isTracking() ? 'text-accent-600' : 'text-secondary-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Auto Tracking</p>
                      <p class="text-lg font-semibold" [class]="locationService.isTracking() ? 'text-accent-600' : 'text-secondary-600'">
                        {{ locationService.isTracking() ? 'Running' : 'Stopped' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Location -->
            <div class="mb-8" *ngIf="locationService.currentLocation()">
              <h4 class="text-lg font-semibold text-secondary-900 mb-4">Current Location</h4>
              <div class="card p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm font-medium text-secondary-600 mb-1">Location</p>
                    <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.location }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-secondary-600 mb-1">Timestamp</p>
                    <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.dateTime | date:'medium' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-secondary-600 mb-1">Coordinates</p>
                    <p class="text-lg text-secondary-900">
                      {{ locationService.currentLocation()?.latitude.toFixed(6) }}, 
                      {{ locationService.currentLocation()?.longitude.toFixed(6) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-secondary-600 mb-1">Accuracy</p>
                    <p class="text-lg text-secondary-900">{{ locationService.currentLocation()?.accuracy.toFixed(1) }}m</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mb-8">
              <h4 class="text-lg font-semibold text-secondary-900 mb-4">Actions</h4>
              <div class="flex flex-wrap gap-4">
                <button
                  *ngIf="!locationService.hasConsent()"
                  (click)="requestConsent()"
                  class="btn btn-primary"
                >
                  Grant Location Permission
                </button>
                
                <button
                  *ngIf="locationService.hasConsent()"
                  (click)="captureLocation()"
                  class="btn btn-secondary"
                >
                  Capture Current Location
                </button>

                <button
                  (click)="showLocationHistory()"
                  class="btn btn-secondary"
                >
                  View History
                </button>

                <button
                  *ngIf="locationService.hasConsent()"
                  (click)="revokeConsent()"
                  class="btn btn-outline"
                >
                  Revoke Consent
                </button>
              </div>
            </div>

            <!-- Recent History -->
            <div *ngIf="recentLocations.length > 0">
              <h4 class="text-lg font-semibold text-secondary-900 mb-4">Recent Locations</h4>
              <div class="space-y-3">
                <div 
                  *ngFor="let location of recentLocations; trackBy: trackByLocation" 
                  class="card p-4 hover:bg-secondary-50 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-medium text-secondary-900">{{ location.location }}</p>
                      <p class="text-sm text-secondary-600">
                        {{ location.dateTime | date:'short' }} • 
                        Accuracy: {{ location.accuracy.toFixed(1) }}m
                      </p>
                      <div class="flex items-center mt-1">
                        <span 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="location.userInitiated ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-800'"
                        >
                          {{ location.userInitiated ? 'Manual' : 'Auto' }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-secondary-500">
                        {{ location.latitude.toFixed(4) }}, {{ location.longitude.toFixed(4) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-secondary-50 px-6 py-4">
            <div class="flex justify-end">
              <button
                (click)="closeModal()"
                class="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white rounded-lg shadow-sm border border-secondary-200;
    }
    .btn {
      @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
    }
    .btn-primary {
      @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
    }
    .btn-secondary {
      @apply text-secondary-700 bg-white border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500;
    }
    .btn-outline {
      @apply text-error-700 bg-white border-error-300 hover:bg-error-50 focus:ring-error-500;
    }
  `]
})
export class LocationModalComponent {
  locationService = inject(LocationService);
  modalService = inject(ModalService);

  recentLocations: LocationData[] = [];

  constructor() {
    this.loadRecentLocations();
  }

  closeModal() {
    this.modalService.closeModal();
  }

  async requestConsent() {
    const granted = await this.locationService.requestLocationConsent();
    if (granted) {
      this.loadRecentLocations();
    }
  }

  async captureLocation() {
    const location = await this.locationService.manualLocationCapture();
    if (location) {
      this.loadRecentLocations();
    }
  }

  revokeConsent() {
    this.locationService.revokeConsent();
  }

  showLocationHistory() {
    this.modalService.closeModal();
    this.modalService.openModal('location-history');
  }

  private loadRecentLocations() {
    const history = this.locationService.getLocationHistory();
    this.recentLocations = history.slice(0, 5); // Show last 5 locations
  }

  trackByLocation(index: number, location: LocationData): string {
    return `${location.dateTime.toString()}_${location.latitude}_${location.longitude}`;
  }
}
