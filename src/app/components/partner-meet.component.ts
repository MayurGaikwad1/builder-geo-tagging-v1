import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService, Partner, Meeting, MeetingPurpose } from '../services/partner.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-partner-meet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">Partner Meet (Customer 360)</h1>
          <p class="text-secondary-600 mt-2">Schedule and manage partner meetings with geo-validation and tracking</p>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="border-b border-secondary-200">
            <nav class="-mb-px flex space-x-8">
              <button 
                (click)="activeTab.set('new-meeting')"
                [class]="getTabClass('new-meeting')"
              >
                New Meeting
              </button>
              <button 
                (click)="activeTab.set('meetings')"
                [class]="getTabClass('meetings')"
              >
                My Meetings
              </button>
              <button 
                (click)="activeTab.set('active')"
                [class]="getTabClass('active')"
              >
                Active Meeting
              </button>
              <button 
                (click)="activeTab.set('analytics')"
                [class]="getTabClass('analytics')"
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        <!-- New Meeting Tab -->
        <div *ngIf="activeTab() === 'new-meeting'" class="space-y-6">
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-secondary-900 mb-6">Schedule New Meeting</h2>
            
            <form (ngSubmit)="createMeeting()" #meetingForm="ngForm" class="space-y-6">
              <!-- Partner Category -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Category *</label>
                  <select 
                    [(ngModel)]="newMeeting.category" 
                    name="category"
                    required
                    (change)="onCategoryChange()"
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    <option value="existing">Existing Partner</option>
                    <option value="new">New Partner</option>
                  </select>
                </div>

                <!-- Sub-Category (for existing partners) -->
                <div *ngIf="newMeeting.category === 'existing'">
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Sub-Category *</label>
                  <select 
                    [(ngModel)]="newMeeting.subCategory" 
                    name="subCategory"
                    required
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select Sub-Category</option>
                    <option value="IC">IC (Individual Contributor)</option>
                    <option value="POSP">POSP</option>
                    <option value="ASO">ASO</option>
                    <option value="IM">IM</option>
                    <option value="RP">RP</option>
                    <option value="EA">EA</option>
                  </select>
                </div>
              </div>

              <!-- Partner Selection/Name -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="newMeeting.category === 'existing'">
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Agent Code *</label>
                  <select 
                    [(ngModel)]="newMeeting.partnerAgentCode" 
                    name="partnerAgentCode"
                    required
                    (change)="onPartnerSelect()"
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select Partner</option>
                    <option *ngFor="let partner of filteredPartners()" [value]="partner.agentCode">
                      {{ partner.agentCode }} - {{ partner.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name *</label>
                  <input 
                    type="text"
                    [(ngModel)]="newMeeting.partnerName"
                    name="partnerName"
                    required
                    [readonly]="newMeeting.category === 'existing' && newMeeting.partnerAgentCode"
                    placeholder="Enter partner name"
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                </div>
              </div>

              <!-- Date & Time -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Date *</label>
                  <input 
                    type="date"
                    [(ngModel)]="newMeeting.date"
                    name="date"
                    required
                    [min]="today()"
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Time *</label>
                  <input 
                    type="time"
                    [(ngModel)]="newMeeting.time"
                    name="time"
                    required
                    class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                </div>
              </div>

              <!-- Purpose -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Purpose *</label>
                <select 
                  [(ngModel)]="newMeeting.purpose" 
                  name="purpose"
                  required
                  class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Purpose</option>
                  <option *ngFor="let purpose of meetingPurposes" [value]="purpose">{{ purpose }}</option>
                </select>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Address *</label>
                <div class="space-y-3">
                  <div *ngIf="newMeeting.category === 'existing'" class="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="useStoredAddress" 
                      [(ngModel)]="newMeeting.useStoredAddress" 
                      [value]="true"
                      name="addressType"
                      class="text-primary-600 focus:ring-primary-500"
                    >
                    <label for="useStoredAddress" class="text-sm text-secondary-700">Use stored partner address</label>
                  </div>
                  <div class="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      id="useNewAddress" 
                      [(ngModel)]="newMeeting.useStoredAddress" 
                      [value]="false"
                      name="addressType"
                      class="text-primary-600 focus:ring-primary-500"
                    >
                    <label for="useNewAddress" class="text-sm text-secondary-700">Enter new address</label>
                  </div>
                </div>

                <textarea 
                  [(ngModel)]="newMeeting.address"
                  name="address"
                  required
                  rows="3"
                  placeholder="Enter meeting address..."
                  [readonly]="newMeeting.useStoredAddress && selectedPartner()"
                  class="mt-3 w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>

              <!-- Contact Number -->
              <div *ngIf="newMeeting.category === 'existing'">
                <label class="block text-sm font-medium text-secondary-700 mb-2">Contact Number</label>
                <input 
                  type="tel"
                  [(ngModel)]="newMeeting.contactNo"
                  name="contactNo"
                  [readonly]="newMeeting.partnerAgentCode"
                  placeholder="Contact number"
                  class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
              </div>

              <!-- Remarks -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Remarks</label>
                <textarea 
                  [(ngModel)]="newMeeting.remark"
                  name="remark"
                  rows="3"
                  placeholder="Optional remarks..."
                  class="w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end space-x-4">
                <button 
                  type="button"
                  (click)="resetForm()"
                  class="btn btn-secondary"
                >
                  Reset
                </button>
                <button 
                  type="submit"
                  [disabled]="!meetingForm.valid || isCreating()"
                  class="btn btn-primary"
                >
                  {{ isCreating() ? 'Creating...' : 'Schedule Meeting' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- My Meetings Tab -->
        <div *ngIf="activeTab() === 'meetings'" class="space-y-6">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-secondary-900">My Meetings</h2>
              <div class="flex items-center space-x-4">
                <select 
                  [(ngModel)]="meetingFilter()"
                  (ngModelChange)="filterMeetings($event)"
                  class="rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Meetings</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="today">Today</option>
                </select>
              </div>
            </div>

            <div *ngIf="filteredMeetings().length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-secondary-900">No meetings found</h3>
              <p class="mt-1 text-sm text-secondary-500">Schedule your first partner meeting to get started.</p>
            </div>

            <div *ngIf="filteredMeetings().length > 0" class="space-y-4">
              <div *ngFor="let meeting of filteredMeetings()" class="border rounded-lg p-4 hover:bg-secondary-50">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="font-semibold text-secondary-900">{{ meeting.partnerName }}</h3>
                      <span [class]="getMeetingStatusClass(meeting.status)">
                        {{ getMeetingStatusText(meeting.status) }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
                      <div>
                        <p><strong>Date:</strong> {{ formatMeetingDate(meeting.meetingDateTime) }}</p>
                        <p><strong>Purpose:</strong> {{ meeting.purpose }}</p>
                        <p *ngIf="meeting.partnerAgentCode"><strong>Agent Code:</strong> {{ meeting.partnerAgentCode }}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {{ meeting.address }}</p>
                        <p *ngIf="meeting.duration"><strong>Duration:</strong> {{ meeting.duration }} minutes</p>
                        <p *ngIf="meeting.checkInStatus !== 'before'"><strong>Check-in:</strong> {{ meeting.checkInStatus }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col space-y-2 ml-4">
                    <button 
                      *ngIf="meeting.status === 'scheduled' && canStartMeeting(meeting)"
                      (click)="startMeeting(meeting)"
                      class="btn btn-primary btn-sm"
                    >
                      Start Meeting
                    </button>
                    <button 
                      *ngIf="meeting.status === 'in-progress'"
                      (click)="openActiveMeeting(meeting)"
                      class="btn btn-success btn-sm"
                    >
                      Active Meeting
                    </button>
                    <button 
                      *ngIf="meeting.status === 'completed'"
                      (click)="viewMeetingDetails(meeting)"
                      class="btn btn-secondary btn-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Meeting Tab -->
        <div *ngIf="activeTab() === 'active'" class="space-y-6">
          <div *ngIf="!activeMeeting()" class="card p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-secondary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 class="text-xl font-semibold text-secondary-900 mb-2">No Active Meeting</h2>
            <p class="text-secondary-600">Start a scheduled meeting to see active meeting controls here.</p>
          </div>

          <div *ngIf="activeMeeting()" class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-secondary-900">{{ activeMeeting()!.partnerName }}</h2>
                <p class="text-secondary-600">{{ activeMeeting()!.purpose }}</p>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold text-primary-600">{{ meetingTimer() }}</div>
                <div class="text-sm text-secondary-500">Meeting Duration</div>
              </div>
            </div>

            <!-- Meeting Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div class="text-center p-4 bg-secondary-50 rounded-lg">
                <div [class]="getLocationStatusClass()"></div>
                <h3 class="font-medium text-secondary-900 mt-2">Location Status</h3>
                <p class="text-sm text-secondary-600">{{ locationStatusText() }}</p>
              </div>
              
              <div class="text-center p-4 bg-secondary-50 rounded-lg">
                <div class="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <svg class="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-secondary-900 mt-2">Check-in Status</h3>
                <p class="text-sm text-secondary-600">{{ activeMeeting()!.checkInStatus }}</p>
              </div>

              <div class="text-center p-4 bg-secondary-50 rounded-lg">
                <div [class]="getSelfieStatusClass()"></div>
                <h3 class="font-medium text-secondary-900 mt-2">Photo Status</h3>
                <p class="text-sm text-secondary-600">{{ activeMeeting()!.selfieUrl ? 'Captured' : 'Not taken' }}</p>
              </div>
            </div>

            <!-- Meeting Code (for new partners) -->
            <div *ngIf="activeMeeting()!.meetingCode" class="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <h3 class="font-medium text-warning-800 mb-2">Meeting Verification Code</h3>
              <div class="flex items-center space-x-4">
                <div class="text-2xl font-mono font-bold text-warning-900">{{ activeMeeting()!.meetingCode }}</div>
                <div class="text-sm text-warning-700">
                  Share this code with the partner for verification
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-4">
              <button 
                (click)="captureSelfiForMeeting()"
                [disabled]="!isAtMeetingLocation()"
                class="btn btn-primary"
              >
                📸 Capture Selfie
              </button>

              <button 
                (click)="completeMeeting()"
                [disabled]="!canCompleteMeeting()"
                class="btn btn-success"
              >
                Complete Meeting
              </button>

              <button 
                (click)="endMeetingEarly()"
                class="btn btn-danger"
              >
                End Meeting Early
              </button>
            </div>

            <!-- Meeting Progress -->
            <div class="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h3 class="font-medium text-secondary-900 mb-3">Meeting Progress</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span>Started at</span>
                  <span>{{ formatTime(activeMeeting()!.startDateTime!) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Location verified</span>
                  <span [class]="isAtMeetingLocation() ? 'text-success-600' : 'text-danger-600'">
                    {{ isAtMeetingLocation() ? '✓ Yes' : '✗ No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Minimum duration (15 min)</span>
                  <span [class]="hasMinimumDuration() ? 'text-success-600' : 'text-warning-600'">
                    {{ hasMinimumDuration() ? '✓ Met' : '⏳ In progress' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div *ngIf="activeTab() === 'analytics'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Stats Cards -->
            <div class="card p-6 text-center">
              <div class="text-2xl font-bold text-primary-600">{{ analytics().totalMeetings }}</div>
              <div class="text-sm text-secondary-600">Total Meetings</div>
            </div>
            
            <div class="card p-6 text-center">
              <div class="text-2xl font-bold text-success-600">{{ analytics().completedMeetings }}</div>
              <div class="text-sm text-secondary-600">Completed</div>
            </div>
            
            <div class="card p-6 text-center">
              <div class="text-2xl font-bold text-warning-600">{{ analytics().scheduledMeetings }}</div>
              <div class="text-sm text-secondary-600">Scheduled</div>
            </div>
            
            <div class="card p-6 text-center">
              <div class="text-2xl font-bold text-accent-600">{{ analytics().averageDuration }}min</div>
              <div class="text-sm text-secondary-600">Avg Duration</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-secondary-900 mb-6">Recent Meeting Activity</h2>
            
            <div *ngIf="recentMeetings().length === 0" class="text-center py-8">
              <p class="text-secondary-500">No recent meeting activity</p>
            </div>

            <div *ngIf="recentMeetings().length > 0" class="space-y-4">
              <div *ngFor="let meeting of recentMeetings()" class="flex items-center justify-between py-3 border-b border-secondary-200">
                <div>
                  <h3 class="font-medium text-secondary-900">{{ meeting.partnerName }}</h3>
                  <p class="text-sm text-secondary-600">{{ meeting.purpose }} • {{ formatMeetingDate(meeting.meetingDateTime) }}</p>
                </div>
                <div class="text-right">
                  <span [class]="getMeetingStatusClass(meeting.status)">
                    {{ getMeetingStatusText(meeting.status) }}
                  </span>
                  <div *ngIf="meeting.duration" class="text-sm text-secondary-500">{{ meeting.duration }} min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden File Input for Selfie -->
        <input 
          #fileInput 
          type="file" 
          accept="image/*" 
          capture="user" 
          style="display: none"
          (change)="onSelfieCapture($event)"
        >
      </div>
    </div>
  `
})
export class PartnerMeetComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab = signal<'new-meeting' | 'meetings' | 'active' | 'analytics'>('new-meeting');
  
  // Meeting form data
  newMeetingData = {
    category: '',
    subCategory: '',
    partnerAgentCode: '',
    partnerName: '',
    date: '',
    time: '',
    purpose: '',
    address: '',
    contactNo: '',
    remark: '',
    useStoredAddress: true
  };

  // UI state
  isCreating = signal(false);
  meetingFilter = signal('all');
  meetingTimer = signal('00:00:00');

  // Data
  allMeetings = signal<Meeting[]>([]);
  filteredMeetings = signal<Meeting[]>([]);
  activeMeeting = signal<Meeting | null>(null);
  selectedPartner = signal<Partner | null>(null);

  meetingPurposes: MeetingPurpose[] = [
    'Goal Setting',
    'New Contest',
    'New Product Training',
    'New Business',
    'Renewals',
    'Activation',
    'Reference Collection',
    'FRAR Pendency',
    'Joint Sales Call',
    'P20',
    'Club Upgradation',
    'MDRT/COT/TOT Qualification'
  ];

  private timerInterval: any;

  constructor(
    private partnerService: PartnerService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.loadMeetings();
    this.loadActiveMeeting();
    this.startMeetingTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Computed properties
  filteredPartners() {
    const category = this.newMeeting().category;
    const subCategory = this.newMeeting().subCategory;
    
    if (category !== 'existing') return [];
    
    let partners = this.partnerService.getPartnersByCategory('existing');
    if (subCategory) {
      partners = partners.filter(p => p.subCategory === subCategory);
    }
    
    return partners;
  }

  analytics() {
    const meetings = this.allMeetings();
    const completed = meetings.filter(m => m.status === 'completed');
    const totalDuration = completed.reduce((sum, m) => sum + (m.duration || 0), 0);
    
    return {
      totalMeetings: meetings.length,
      completedMeetings: completed.length,
      scheduledMeetings: meetings.filter(m => m.status === 'scheduled').length,
      averageDuration: completed.length > 0 ? Math.round(totalDuration / completed.length) : 0
    };
  }

  recentMeetings() {
    return this.allMeetings()
      .sort((a, b) => new Date(b.meetingDateTime).getTime() - new Date(a.meetingDateTime).getTime())
      .slice(0, 10);
  }

  // Tab management
  getTabClass(tab: string): string {
    const baseClass = 'py-2 px-1 border-b-2 font-medium text-sm';
    if (this.activeTab() === tab) {
      return `${baseClass} border-primary-500 text-primary-600`;
    }
    return `${baseClass} border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300`;
  }

  // Form handlers
  onCategoryChange() {
    const meeting = this.newMeeting();
    meeting.subCategory = '';
    meeting.partnerAgentCode = '';
    meeting.partnerName = '';
    meeting.address = '';
    meeting.contactNo = '';
    this.newMeeting.set({ ...meeting });
    this.selectedPartner.set(null);
  }

  onPartnerSelect() {
    const agentCode = this.newMeeting().partnerAgentCode;
    if (agentCode) {
      const partner = this.partnerService.getPartnerByAgentCode(agentCode);
      if (partner) {
        this.selectedPartner.set(partner);
        const meeting = this.newMeeting();
        meeting.partnerName = partner.name;
        meeting.contactNo = partner.contactNo || '';
        if (meeting.useStoredAddress) {
          meeting.address = partner.address;
        }
        this.newMeeting.set({ ...meeting });
      }
    }
  }

  async createMeeting() {
    if (this.isCreating()) return;
    
    this.isCreating.set(true);
    
    try {
      const meeting = this.newMeeting();
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      
      const result = await this.partnerService.createMeeting({
        partnerAgentCode: meeting.partnerAgentCode || undefined,
        partnerName: meeting.partnerName,
        meetingDateTime,
        purpose: meeting.purpose as MeetingPurpose,
        address: meeting.address,
        remark: meeting.remark,
        latitude: this.selectedPartner()?.latitude,
        longitude: this.selectedPartner()?.longitude
      });

      if (result.success) {
        alert('Meeting scheduled successfully!');
        this.resetForm();
        this.loadMeetings();
        this.activeTab.set('meetings');
      } else {
        alert(`Failed to create meeting: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      this.isCreating.set(false);
    }
  }

  resetForm() {
    this.newMeeting.set({
      category: '',
      subCategory: '',
      partnerAgentCode: '',
      partnerName: '',
      date: '',
      time: '',
      purpose: '',
      address: '',
      contactNo: '',
      remark: '',
      useStoredAddress: true
    });
    this.selectedPartner.set(null);
  }

  // Meeting management
  loadMeetings() {
    this.allMeetings.set(this.partnerService.meetings());
    this.filterMeetings(this.meetingFilter());
  }

  loadActiveMeeting() {
    this.activeMeeting.set(this.partnerService.activeMeeting());
  }

  filterMeetings(filter: string) {
    this.meetingFilter.set(filter);
    let meetings = this.allMeetings();
    
    switch (filter) {
      case 'scheduled':
        meetings = meetings.filter(m => m.status === 'scheduled');
        break;
      case 'completed':
        meetings = meetings.filter(m => m.status === 'completed');
        break;
      case 'today':
        const today = new Date().toDateString();
        meetings = meetings.filter(m => new Date(m.meetingDateTime).toDateString() === today);
        break;
    }
    
    this.filteredMeetings.set(meetings);
  }

  canStartMeeting(meeting: Meeting): boolean {
    const now = new Date();
    const meetingTime = new Date(meeting.meetingDateTime);
    const timeDiff = now.getTime() - meetingTime.getTime();
    
    // Can start 15 minutes before to 30 minutes after scheduled time
    return timeDiff >= -15 * 60 * 1000 && timeDiff <= 30 * 60 * 1000;
  }

  async startMeeting(meeting: Meeting) {
    try {
      const meetingCode = meeting.meetingCode;
      let code: string | undefined;

      if (meetingCode) {
        code = prompt('Enter the meeting verification code:');
        if (!code) return;
      }

      const result = await this.partnerService.startMeeting(meeting.meetingId, code);
      
      if (result.success) {
        this.loadMeetings();
        this.loadActiveMeeting();
        this.activeTab.set('active');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert('Failed to start meeting. Please try again.');
    }
  }

  openActiveMeeting(meeting: Meeting) {
    this.activeMeeting.set(meeting);
    this.activeTab.set('active');
  }

  viewMeetingDetails(meeting: Meeting) {
    const details = `Meeting Details:
    
Partner: ${meeting.partnerName}
Date: ${this.formatMeetingDate(meeting.meetingDateTime)}
Purpose: ${meeting.purpose}
Status: ${this.getMeetingStatusText(meeting.status)}
Duration: ${meeting.duration || 'N/A'} minutes
Address: ${meeting.address}
${meeting.remark ? `Remarks: ${meeting.remark}` : ''}`;
    
    alert(details);
  }

  // Active meeting management
  startMeetingTimer() {
    this.timerInterval = setInterval(() => {
      const active = this.activeMeeting();
      if (active && active.startDateTime) {
        const now = new Date();
        const start = new Date(active.startDateTime);
        const diff = now.getTime() - start.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.meetingTimer.set(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        this.meetingTimer.set('00:00:00');
      }
    }, 1000);
  }

  isAtMeetingLocation(): boolean {
    const meeting = this.activeMeeting();
    if (!meeting || !meeting.latitude || !meeting.longitude) return false;
    
    return this.locationService.isWithinGeofence(
      meeting.latitude,
      meeting.longitude,
      100 // 100 meters
    );
  }

  hasMinimumDuration(): boolean {
    const meeting = this.activeMeeting();
    if (!meeting || !meeting.startDateTime) return false;
    
    const now = new Date();
    const start = new Date(meeting.startDateTime);
    const minutes = (now.getTime() - start.getTime()) / (1000 * 60);
    
    return minutes >= 15;
  }

  canCompleteMeeting(): boolean {
    return this.isAtMeetingLocation() && this.hasMinimumDuration();
  }

  captureSelfiForMeeting() {
    if (!this.isAtMeetingLocation()) {
      alert('You must be at the meeting location to capture a selfie.');
      return;
    }
    
    this.fileInput.nativeElement.click();
  }

  async onSelfieCapture(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file || !this.activeMeeting()) return;
    
    try {
      const result = await this.partnerService.captureSelfie(
        this.activeMeeting()!.meetingId,
        file
      );
      
      if (result.success) {
        alert('Selfie captured successfully!');
        this.loadActiveMeeting();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error capturing selfie:', error);
      alert('Failed to capture selfie. Please try again.');
    }
  }

  async completeMeeting() {
    if (!this.canCompleteMeeting()) {
      alert('Meeting cannot be completed yet. Ensure you are at the location and have met the minimum duration.');
      return;
    }
    
    try {
      const result = await this.partnerService.completeMeeting(this.activeMeeting()!.meetingId);
      
      if (result.success) {
        alert('Meeting completed successfully!');
        this.loadMeetings();
        this.loadActiveMeeting();
        this.activeTab.set('meetings');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error completing meeting:', error);
      alert('Failed to complete meeting. Please try again.');
    }
  }

  async endMeetingEarly() {
    if (confirm('Are you sure you want to end this meeting early?')) {
      try {
        const result = await this.partnerService.completeMeeting(this.activeMeeting()!.meetingId);
        
        if (result.success) {
          this.loadMeetings();
          this.loadActiveMeeting();
          this.activeTab.set('meetings');
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error ending meeting:', error);
        alert('Failed to end meeting. Please try again.');
      }
    }
  }

  // Status classes and text
  getLocationStatusClass(): string {
    const baseClass = 'h-8 w-8 rounded-full flex items-center justify-center mx-auto';
    if (this.isAtMeetingLocation()) {
      return `${baseClass} bg-success-100 text-success-600`;
    }
    return `${baseClass} bg-danger-100 text-danger-600`;
  }

  getSelfieStatusClass(): string {
    const baseClass = 'h-8 w-8 rounded-full flex items-center justify-center mx-auto';
    if (this.activeMeeting()?.selfieUrl) {
      return `${baseClass} bg-success-100 text-success-600`;
    }
    return `${baseClass} bg-secondary-100 text-secondary-600`;
  }

  locationStatusText(): string {
    return this.isAtMeetingLocation() ? 'At Location' : 'Away from Location';
  }

  getMeetingStatusClass(status: Meeting['status']): string {
    switch (status) {
      case 'completed':
        return 'status-badge status-success';
      case 'in-progress':
        return 'status-badge status-info';
      case 'scheduled':
        return 'status-badge status-warning';
      default:
        return 'status-badge status-info';
    }
  }

  getMeetingStatusText(status: Meeting['status']): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  }

  // Utility methods
  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatMeetingDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }
}
