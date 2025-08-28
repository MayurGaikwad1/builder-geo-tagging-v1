import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { LocationService } from "../services/location.service";

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
            <a
              routerLink="/"
              routerLinkActive="text-primary-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              routerLink="/location"
              routerLinkActive="text-primary-600"
              class="px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Location
            </a>
            <a
              routerLink="/partner-meet"
              routerLinkActive="text-primary-600"
              class="px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Partner Meet
            </a>
            <a
              routerLink="/reports"
              routerLinkActive="text-primary-600"
              class="px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Reports
            </a>
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
          <a
            routerLink="/"
            routerLinkActive="bg-primary-50 text-primary-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
            (click)="closeMobileMenu()"
          >
            Dashboard
          </a>
          <a
            routerLink="/location"
            routerLinkActive="bg-primary-50 text-primary-600"
            class="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
            (click)="closeMobileMenu()"
          >
            Location Tracking
          </a>
          <a
            routerLink="/partner-meet"
            routerLinkActive="bg-primary-50 text-primary-600"
            class="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
            (click)="closeMobileMenu()"
          >
            Partner Meet (Customer 360)
          </a>
          <a
            routerLink="/reports"
            routerLinkActive="bg-primary-50 text-primary-600"
            class="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50"
            (click)="closeMobileMenu()"
          >
            Reports
          </a>
        </div>
      </div>
    </nav>
  `,
})
export class NavigationComponent {
  private isMobileMenuOpen = signal(false);

  currentUser = signal({
    name: "John Doe",
    agentCode: "AG001",
    empId: "EMP001",
  });

  constructor(
    private locationService: LocationService,
    private router: Router,
  ) {
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

    return `${baseClass} bg-danger-500`;
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
