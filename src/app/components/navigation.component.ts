import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { LocationService } from "../services/location.service";
import { ModalService } from "../services/modal.service";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-secondary-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and brand -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div
                class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h1 class="text-xl font-semibold text-secondary-900">
                  Geo-Tagging
                </h1>
                <p class="text-xs text-secondary-500">
                  Location & Partner Management
                </p>
              </div>
            </div>
          </div>

          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <button
              (click)="navigateToDashboard()"
              [class]="getNavLinkClass(activePage() === 'dashboard')"
            >
              <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"/>
              </svg>
              Dashboard
            </button>
            <button
              (click)="openLocationModal()"
              [class]="getNavLinkClass(activePage() === 'location')"
            >
              <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Location
            </button>
            <button
              (click)="openPartnerMeetModal()"
              [class]="getNavLinkClass(activePage() === 'partner-meet')"
            >
              <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Partner Meet
            </button>
            <button
              (click)="openAnalyticsModal()"
              [class]="getNavLinkClass(activePage() === 'analytics')"
            >
              <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Analytics
            </button>
          </div>

          <!-- User menu and status indicators -->
          <div class="flex items-center space-x-4">
            <!-- Location status indicator -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center">
                <div [class]="locationStatusClass()"></div>
                <span class="text-xs text-secondary-600 ml-1">{{
                  locationStatusText()
                }}</span>
              </div>
            </div>

            <!-- User profile -->
            <div class="flex items-center space-x-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-secondary-900">
                  {{ currentUser().name }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ currentUser().agentCode }}
                </p>
              </div>
              <div
                class="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center"
              >
                <span class="text-sm font-medium text-primary-600">{{
                  userInitials()
                }}</span>
              </div>
            </div>

            <!-- Mobile menu button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div [class]="mobileMenuClass()" class="md:hidden">
        <div
          class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-secondary-200"
        >
          <button
            (click)="navigateToDashboard(); closeMobileMenu()"
            [class]="getMobileNavLinkClass(activePage() === 'dashboard')"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
            </svg>
            Dashboard
          </button>
          <button
            (click)="openLocationModal(); closeMobileMenu()"
            [class]="getMobileNavLinkClass(activePage() === 'location')"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            Location Tracking
          </button>
          <button
            (click)="openPartnerMeetModal(); closeMobileMenu()"
            [class]="getMobileNavLinkClass(activePage() === 'partner-meet')"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Partner Meet (Customer 360)
          </button>
          <button
            (click)="openAnalyticsModal(); closeMobileMenu()"
            [class]="getMobileNavLinkClass(activePage() === 'analytics')"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Analytics & Reports
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-button {
      @apply px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500;
    }
    .nav-button-active {
      @apply text-primary-600 bg-primary-50;
    }
    .nav-button-inactive {
      @apply text-secondary-700 hover:text-primary-600 hover:bg-primary-50;
    }
    .mobile-nav-button {
      @apply w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500;
    }
    .mobile-nav-button-active {
      @apply bg-primary-50 text-primary-600;
    }
    .mobile-nav-button-inactive {
      @apply text-secondary-700 hover:text-primary-600 hover:bg-primary-50;
    }
  `]
})
export class NavigationComponent {
  private isMobileMenuOpen = signal(false);
  public activePage = signal('dashboard');

  locationService = inject(LocationService);
  modalService = inject(ModalService);
  router = inject(Router);

  currentUser = signal({
    name: "John Doe",
    agentCode: "AG001",
    empId: "EMP001",
  });

  constructor() {
    // Load user data from localStorage
    const employeeData = JSON.parse(
      localStorage.getItem("employeeData") || "{}",
    );
    if (employeeData.empName) {
      this.currentUser.set({
        name: employeeData.empName,
        agentCode: employeeData.empAgentCode || "N/A",
        empId: employeeData.empId || "N/A",
      });
    }
  }

  // Navigation methods
  navigateToDashboard() {
    this.activePage.set('dashboard');
    this.router.navigate(['/']);
  }

  openLocationModal() {
    this.activePage.set('location');
    this.modalService.openModal('location');
  }

  openPartnerMeetModal() {
    this.activePage.set('partner-meet');
    this.modalService.openModal('partner-meet');
  }

  openAnalyticsModal() {
    this.activePage.set('analytics');
    this.modalService.openModal('analytics');
  }

  // Styling methods
  getNavLinkClass(isActive: boolean): string {
    const baseClass = 'nav-button';
    return isActive ? `${baseClass} nav-button-active` : `${baseClass} nav-button-inactive`;
  }

  getMobileNavLinkClass(isActive: boolean): string {
    const baseClass = 'mobile-nav-button';
    return isActive ? `${baseClass} mobile-nav-button-active` : `${baseClass} mobile-nav-button-inactive`;
  }

  userInitials(): string {
    const name = this.currentUser().name;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  locationStatusClass(): string {
    const baseClass = "h-2 w-2 rounded-full";

    if (!this.locationService.hasConsent()) {
      return `${baseClass} bg-secondary-400`;
    }

    if (!this.locationService.isGpsEnabled()) {
      return `${baseClass} bg-warning-500`;
    }

    if (this.locationService.isTracking()) {
      return `${baseClass} bg-success-500 animate-pulse`;
    }

    return `${baseClass} bg-error-500`;
  }

  locationStatusText(): string {
    if (!this.locationService.hasConsent()) {
      return "No Consent";
    }

    if (!this.locationService.isGpsEnabled()) {
      return "GPS Off";
    }

    if (this.locationService.isTracking()) {
      return "Tracking";
    }

    return "Offline";
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  mobileMenuClass(): string {
    return this.isMobileMenuOpen() ? "block" : "hidden";
  }
}
