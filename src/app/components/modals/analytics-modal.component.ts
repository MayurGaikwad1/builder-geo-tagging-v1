import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js";
import {
  AnalyticsService,
  LocationAnalytics,
  BranchAnalytics,
  MeetingAnalytics,
  ComplianceMetrics,
  PerformanceKPIs,
  DateRange,
} from "../../services/analytics.service";
import { ModalService } from "../../services/modal.service";

Chart.register(...registerables);

@Component({
  selector: "app-analytics-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 overflow-y-auto"
      [class.hidden]="!modalService.isModalOpen('analytics')"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity"
          (click)="closeModal()"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full"
        >
          <!-- Header -->
          <div class="bg-white px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">
                Analytics Dashboard
              </h3>
              <div class="flex items-center space-x-4">
                <!-- Export buttons -->
                <div class="flex gap-2">
                  <button
                    (click)="exportData('excel')"
                    class="btn btn-secondary btn-sm"
                  >
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Excel
                  </button>
                  <button
                    (click)="exportData('csv')"
                    class="btn btn-secondary btn-sm"
                  >
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    CSV
                  </button>
                </div>
                <button
                  (click)="closeModal()"
                  class="text-secondary-400 hover:text-secondary-500 focus:outline-none focus:text-secondary-500 transition ease-in-out duration-150"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="bg-secondary-50 px-6 py-4 border-b border-secondary-200">
            <div class="flex flex-wrap items-center gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1"
                  >Date Range</label
                >
                <div class="flex items-center gap-2">
                  <input
                    type="date"
                    [(ngModel)]="startDate"
                    class="form-input-sm"
                  />
                  <span class="text-secondary-500">to</span>
                  <input
                    type="date"
                    [(ngModel)]="endDate"
                    class="form-input-sm"
                  />
                  <button
                    (click)="updateAnalytics()"
                    class="btn btn-primary btn-sm"
                    [disabled]="analyticsService.isLoading()"
                  >
                    <span
                      *ngIf="analyticsService.isLoading()"
                      class="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"
                    ></span>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="border-b border-secondary-200 px-6">
            <nav class="-mb-px flex space-x-8">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [class]="
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                "
              >
                <svg [innerHTML]="tab.icon" class="w-4 h-4 mr-2 inline"></svg>
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Content -->
          <div
            class="bg-white px-6 py-6 max-h-96 overflow-y-auto"
            id="analytics-content"
          >
            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'overview'" class="space-y-6">
              <!-- KPI Cards -->
              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                *ngIf="performanceKPIs"
              >
                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-secondary-600">
                        Overall Performance
                      </p>
                      <p
                        class="text-2xl font-bold"
                        [class]="
                          getGradeColor(performanceKPIs.overallPerformanceGrade)
                        "
                      >
                        {{ performanceKPIs.overallPerformanceGrade }}
                      </p>
                    </div>
                    <div class="p-2 bg-primary-100 rounded-full">
                      <svg
                        class="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-secondary-600">
                        Activity Score
                      </p>
                      <p class="text-2xl font-bold text-secondary-900">
                        {{ performanceKPIs.activityScore.toFixed(1) }}%
                      </p>
                    </div>
                    <div class="p-2 bg-success-100 rounded-full">
                      <svg
                        class="w-5 h-5 text-success-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-secondary-600">
                        Compliance Score
                      </p>
                      <p
                        class="text-2xl font-bold text-secondary-900"
                        *ngIf="complianceMetrics"
                      >
                        {{ complianceMetrics.overallScore.toFixed(1) }}%
                      </p>
                    </div>
                    <div class="p-2 bg-accent-100 rounded-full">
                      <svg
                        class="w-5 h-5 text-accent-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="card p-4">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-secondary-600">
                        Meeting Success
                      </p>
                      <p
                        class="text-2xl font-bold text-secondary-900"
                        *ngIf="meetingAnalytics"
                      >
                        {{ meetingAnalytics.completionRate.toFixed(1) }}%
                      </p>
                    </div>
                    <div class="p-2 bg-warning-100 rounded-full">
                      <svg
                        class="w-5 h-5 text-warning-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Performance Chart -->
              <div class="card p-4">
                <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                  Performance Trend
                </h4>
                <div class="h-48">
                  <canvas #performanceTrendChart></canvas>
                </div>
              </div>
            </div>

            <!-- Location Analytics Tab -->
            <div *ngIf="activeTab === 'location'" class="space-y-6">
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
                *ngIf="locationAnalytics"
              >
                <!-- Location Stats -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Location Statistics
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Total Locations</span>
                      <span class="font-semibold">{{
                        locationAnalytics.totalLocations
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Daily Average</span>
                      <span class="font-semibold">{{
                        locationAnalytics.dailyAverage.toFixed(1)
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Avg Accuracy</span>
                      <span class="font-semibold"
                        >{{
                          locationAnalytics.accuracyAverage.toFixed(1)
                        }}m</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Location Chart -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Daily Location Trend
                  </h4>
                  <div class="h-48">
                    <canvas #locationChart></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- Branch Activities Tab -->
            <div *ngIf="activeTab === 'branch'" class="space-y-6">
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
                *ngIf="branchAnalytics"
              >
                <!-- Branch Stats -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Branch Activity Statistics
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Check-in Rate</span>
                      <span class="font-semibold text-success-600"
                        >{{ branchAnalytics.checkInRate.toFixed(1) }}%</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Huddle Completion</span>
                      <span class="font-semibold text-primary-600"
                        >{{
                          branchAnalytics.huddleCompletionRate.toFixed(1)
                        }}%</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Closure Rate</span>
                      <span class="font-semibold text-warning-600"
                        >{{
                          branchAnalytics.closureCompletionRate.toFixed(1)
                        }}%</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Branch Compliance Chart -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Branch Compliance
                  </h4>
                  <div class="h-48">
                    <canvas #branchChart></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- Partner Meetings Tab -->
            <div *ngIf="activeTab === 'meetings'" class="space-y-6">
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
                *ngIf="meetingAnalytics"
              >
                <!-- Meeting Stats -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Meeting Statistics
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Total Meetings</span>
                      <span class="font-semibold">{{
                        meetingAnalytics.totalMeetings
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Completed</span>
                      <span class="font-semibold text-success-600">{{
                        meetingAnalytics.completedMeetings
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Completion Rate</span>
                      <span class="font-semibold"
                        >{{ meetingAnalytics.completionRate.toFixed(1) }}%</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Meeting Status Chart -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Meeting Status Distribution
                  </h4>
                  <div class="h-48">
                    <canvas #meetingStatusChart></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compliance Tab -->
            <div *ngIf="activeTab === 'compliance'" class="space-y-6">
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
                *ngIf="complianceMetrics"
              >
                <!-- Compliance Overview -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Compliance Overview
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Overall Score</span>
                      <span
                        class="font-semibold"
                        [class]="
                          getComplianceColor(complianceMetrics.overallScore)
                        "
                        >{{ complianceMetrics.overallScore.toFixed(1) }}%</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-secondary-600">Risk Level</span>
                      <span
                        class="font-semibold"
                        [class]="getRiskColor(complianceMetrics.riskScore)"
                        >{{ complianceMetrics.riskScore.toUpperCase() }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Compliance Chart -->
                <div class="card p-4">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">
                    Compliance Breakdown
                  </h4>
                  <div class="h-48">
                    <canvas #complianceChart></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-secondary-50 px-6 py-4">
            <div class="flex justify-end">
              <button (click)="closeModal()" class="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        @apply bg-white rounded-lg shadow-sm border border-secondary-200;
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
      .form-input-sm {
        @apply block w-32 rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm;
      }
    `,
  ],
})
export class AnalyticsModalComponent implements OnInit, OnDestroy {
  @ViewChild("performanceTrendChart")
  performanceTrendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("locationChart") locationChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("branchChart") branchChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("meetingStatusChart")
  meetingStatusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("complianceChart") complianceChart!: ElementRef<HTMLCanvasElement>;

  analyticsService = inject(AnalyticsService);
  modalService = inject(ModalService);

  activeTab = "overview";
  startDate = "";
  endDate = "";

  // Charts
  private charts: { [key: string]: Chart } = {};

  // Data
  get locationAnalytics() {
    return this.analyticsService.locationAnalytics();
  }
  get branchAnalytics() {
    return this.analyticsService.branchAnalytics();
  }
  get meetingAnalytics() {
    return this.analyticsService.meetingAnalytics();
  }
  get complianceMetrics() {
    return this.analyticsService.complianceMetrics();
  }
  get performanceKPIs() {
    return this.analyticsService.performanceKPIs();
  }

  tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
    },
    {
      id: "location",
      name: "Location",
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>',
    },
    {
      id: "branch",
      name: "Branch",
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
    },
    {
      id: "meetings",
      name: "Meetings",
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
    },
    {
      id: "compliance",
      name: "Compliance",
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
    },
  ];

  ngOnInit() {
    // Initialize date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = today.toISOString().split("T")[0];
    this.startDate = thirtyDaysAgo.toISOString().split("T")[0];

    // Wait for view init to create charts
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy() {
    // Destroy all charts
    Object.values(this.charts).forEach((chart) => chart.destroy());
  }

  closeModal() {
    this.modalService.closeModal();
  }

  updateAnalytics() {
    const dateRange: DateRange = {
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
    };

    this.analyticsService.generateAnalytics(dateRange).then(() => {
      // Update charts after data refresh
      setTimeout(() => {
        this.updateCharts();
      }, 100);
    });
  }

  private initializeCharts() {
    this.createPerformanceTrendChart();
    this.createLocationChart();
    this.createBranchChart();
    this.createMeetingStatusChart();
    this.createComplianceChart();
  }

  private updateCharts() {
    // Destroy existing charts
    Object.values(this.charts).forEach((chart) => chart.destroy());
    this.charts = {};

    // Recreate charts with new data
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private createPerformanceTrendChart() {
    if (!this.performanceTrendChart?.nativeElement || !this.performanceKPIs)
      return;

    const ctx = this.performanceTrendChart.nativeElement.getContext("2d");
    if (!ctx) return;

    const data = Object.entries(this.performanceKPIs.trends.daily).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    this.charts["performanceTrend"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map(([date]) => new Date(date).toLocaleDateString()),
        datasets: [
          {
            label: "Performance Score",
            data: data.map(([, score]) => score),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }

  private createLocationChart() {
    if (!this.locationChart?.nativeElement || !this.locationAnalytics) return;

    const ctx = this.locationChart.nativeElement.getContext("2d");
    if (!ctx) return;

    const data = Object.entries(this.locationAnalytics.locationsByDay).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    this.charts["location"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(([date]) => new Date(date).toLocaleDateString()),
        datasets: [
          {
            label: "Locations Captured",
            data: data.map(([, count]) => count),
            backgroundColor: "rgba(34, 197, 94, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  private createBranchChart() {
    if (!this.branchChart?.nativeElement || !this.branchAnalytics) return;

    const ctx = this.branchChart.nativeElement.getContext("2d");
    if (!ctx) return;

    this.charts["branch"] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Check-in", "Huddle", "Closure", "On-time"],
        datasets: [
          {
            data: [
              this.branchAnalytics.checkInRate,
              this.branchAnalytics.huddleCompletionRate,
              this.branchAnalytics.closureCompletionRate,
              this.branchAnalytics.onTimeRate,
            ],
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(168, 85, 247, 0.8)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  private createMeetingStatusChart() {
    if (!this.meetingStatusChart?.nativeElement || !this.meetingAnalytics)
      return;

    const ctx = this.meetingStatusChart.nativeElement.getContext("2d");
    if (!ctx) return;

    this.charts["meetingStatus"] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(this.meetingAnalytics.meetingsByStatus),
        datasets: [
          {
            data: Object.values(this.meetingAnalytics.meetingsByStatus),
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(59, 130, 246, 0.8)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  private createComplianceChart() {
    if (!this.complianceChart?.nativeElement || !this.complianceMetrics) return;

    const ctx = this.complianceChart.nativeElement.getContext("2d");
    if (!ctx) return;

    this.charts["compliance"] = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Location", "Branch", "Meeting", "Policy Adherence"],
        datasets: [
          {
            label: "Compliance Score",
            data: [
              this.complianceMetrics.locationCompliance,
              this.complianceMetrics.branchCompliance,
              this.complianceMetrics.meetingCompliance,
              this.complianceMetrics.policyAdherence,
            ],
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            borderColor: "rgba(168, 85, 247, 0.8)",
            pointBackgroundColor: "rgba(168, 85, 247, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }

  async exportData(format: "excel" | "csv") {
    try {
      if (format === "excel") {
        await this.analyticsService.exportToExcel("all");
      } else if (format === "csv") {
        await this.analyticsService.exportToCSV(this.getActiveReportType());
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  }

  private getActiveReportType():
    | "location"
    | "branch"
    | "meetings"
    | "compliance"
    | "performance" {
    switch (this.activeTab) {
      case "location":
        return "location";
      case "branch":
        return "branch";
      case "meetings":
        return "meetings";
      case "compliance":
        return "compliance";
      default:
        return "performance";
    }
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case "A":
        return "text-success-600";
      case "B":
        return "text-primary-600";
      case "C":
        return "text-warning-600";
      case "D":
        return "text-warning-700";
      case "F":
        return "text-red-600";
      default:
        return "text-secondary-600";
    }
  }

  getComplianceColor(score: number): string {
    if (score >= 90) return "text-success-600";
    if (score >= 80) return "text-primary-600";
    if (score >= 70) return "text-warning-600";
    if (score >= 60) return "text-warning-700";
    return "text-red-600";
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case "low":
        return "text-success-600";
      case "medium":
        return "text-warning-600";
      case "high":
        return "text-red-600";
      default:
        return "text-secondary-600";
    }
  }
}
