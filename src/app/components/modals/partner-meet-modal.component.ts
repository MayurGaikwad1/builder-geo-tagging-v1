import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService, Partner, Meeting, MeetingPurpose } from '../../services/partner.service';
import { LocationService } from '../../services/location.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-partner-meet-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" [class.hidden]="!modalService.isModalOpen('partner-meet')">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <!-- Header -->
          <div class="bg-white px-6 py-4 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">Partner Meetings</h3>
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

          <!-- Tab Navigation -->
          <div class="border-b border-secondary-200 px-6">
            <nav class="-mb-px flex space-x-8">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab.set(tab.id)"
                [class]="activeTab() === tab.id 
                  ? 'border-primary-500 text-primary-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Content -->
          <div class="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            <!-- New Meeting Tab -->
            <div *ngIf="activeTab() === 'new'" class="space-y-6">
              <h4 class="text-lg font-semibold text-secondary-900">Schedule New Meeting</h4>
              
              <form (ngSubmit)="scheduleMeeting()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Partner Category -->
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Category</label>
                    <select [(ngModel)]="newMeetingData.category" name="category" required class="form-select">
                      <option value="">Select Category</option>
                      <option value="existing">Existing Partner</option>
                      <option value="new">New Partner</option>
                    </select>
                  </div>

                  <!-- Sub Category -->
                  <div *ngIf="newMeetingData.category === 'existing'">
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Sub Category</label>
                    <select [(ngModel)]="newMeetingData.subCategory" name="subCategory" class="form-select">
                      <option value="">Select Sub Category</option>
                      <option value="IC">IC</option>
                      <option value="POSP">POSP</option>
                      <option value="ASO">ASO</option>
                      <option value="IM">IM</option>
                      <option value="RP">RP</option>
                      <option value="EA">EA</option>
                    </select>
                  </div>

                  <!-- Partner Selection -->
                  <div *ngIf="newMeetingData.category === 'existing'" class="md:col-span-2">
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Select Partner</label>
                    <select [(ngModel)]="newMeetingData.partnerAgentCode" name="partnerAgentCode" class="form-select">
                      <option value="">Select Partner</option>
                      <option *ngFor="let partner of getFilteredPartners()" [value]="partner.agentCode">
                        {{ partner.name }} ({{ partner.agentCode }})
                      </option>
                    </select>
                  </div>

                  <!-- Partner Name (for new partners) -->
                  <div *ngIf="newMeetingData.category === 'new'" class="md:col-span-2">
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name</label>
                    <input 
                      type="text" 
                      [(ngModel)]="newMeetingData.partnerName" 
                      name="partnerName" 
                      required 
                      class="form-input"
                      placeholder="Enter partner name"
                    />
                  </div>

                  <!-- Date -->
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Date</label>
                    <input 
                      type="date" 
                      [(ngModel)]="newMeetingData.date" 
                      name="date" 
                      required 
                      class="form-input"
                      [min]="getTodayDate()"
                    />
                  </div>

                  <!-- Time -->
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Time</label>
                    <input 
                      type="time" 
                      [(ngModel)]="newMeetingData.time" 
                      name="time" 
                      required 
                      class="form-input"
                    />
                  </div>

                  <!-- Purpose -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Purpose</label>
                    <select [(ngModel)]="newMeetingData.purpose" name="purpose" required class="form-select">
                      <option value="">Select Purpose</option>
                      <option *ngFor="let purpose of meetingPurposes" [value]="purpose">{{ purpose }}</option>
                    </select>
                  </div>

                  <!-- Address -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Meeting Address</label>
                    <div class="space-y-2">
                      <div class="flex items-center" *ngIf="locationService.currentLocation()">
                        <input 
                          type="checkbox" 
                          [(ngModel)]="newMeetingData.useStoredAddress" 
                          name="useStoredAddress" 
                          id="useStoredAddress" 
                          class="form-checkbox"
                        />
                        <label for="useStoredAddress" class="ml-2 text-sm text-secondary-700">
                          Use current location: {{ locationService.currentLocation()?.location }}
                        </label>
                      </div>
                      <textarea 
                        [(ngModel)]="newMeetingData.address" 
                        name="address" 
                        required 
                        [disabled]="newMeetingData.useStoredAddress"
                        class="form-textarea"
                        rows="3"
                        placeholder="Enter meeting address"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Contact Number -->
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Contact Number</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="newMeetingData.contactNo" 
                      name="contactNo" 
                      class="form-input"
                      placeholder="Enter contact number"
                    />
                  </div>

                  <!-- Remarks -->
                  <div>
                    <label class="block text-sm font-medium text-secondary-700 mb-2">Remarks</label>
                    <input 
                      type="text" 
                      [(ngModel)]="newMeetingData.remark" 
                      name="remark" 
                      class="form-input"
                      placeholder="Optional remarks"
                    />
                  </div>
                </div>

                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="resetForm()" class="btn btn-secondary">
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </div>

            <!-- My Meetings Tab -->
            <div *ngIf="activeTab() === 'meetings'" class="space-y-6">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-semibold text-secondary-900">My Meetings</h4>
                <select [(ngModel)]="meetingFilter" class="form-select">
                  <option value="all">All Meetings</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="today">Today</option>
                </select>
              </div>

              <div class="space-y-4">
                <div 
                  *ngFor="let meeting of getFilteredMeetings(); trackBy: trackByMeeting" 
                  class="card p-4 hover:bg-secondary-50 transition-colors cursor-pointer"
                  (click)="viewMeetingDetails(meeting)"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <h5 class="font-semibold text-secondary-900">{{ meeting.partnerName }}</h5>
                        <span 
                          class="status-badge"
                          [class]="getStatusBadgeClass(meeting.status)"
                        >
                          {{ meeting.status }}
                        </span>
                      </div>
                      <p class="text-sm text-secondary-600 mb-1">{{ meeting.purpose }}</p>
                      <p class="text-sm text-secondary-600 mb-1">{{ meeting.address }}</p>
                      <p class="text-sm text-secondary-500">
                        {{ meeting.meetingDateTime | date:'medium' }}
                        <span *ngIf="meeting.duration"> • Duration: {{ meeting.duration }} min</span>
                      </p>
                    </div>
                    <div class="text-right">
                      <button 
                        *ngIf="meeting.status === 'scheduled' && isToday(meeting.meetingDateTime)"
                        (click)="startMeeting(meeting); $event.stopPropagation()"
                        class="btn btn-primary btn-sm"
                      >
                        Start Meeting
                      </button>
                      <button 
                        *ngIf="meeting.status === 'in-progress'"
                        (click)="completeMeeting(meeting); $event.stopPropagation()"
                        class="btn btn-success btn-sm"
                      >
                        Complete Meeting
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="getFilteredMeetings().length === 0" class="text-center py-8 text-secondary-500">
                  No meetings found for the selected filter.
                </div>
              </div>
            </div>

            <!-- Active Meeting Tab -->
            <div *ngIf="activeTab() === 'active'" class="space-y-6">
              <h4 class="text-lg font-semibold text-secondary-900">Active Meeting</h4>
              
              <div *ngIf="partnerService.activeMeeting(); else noActiveMeeting" class="space-y-6">
                <div class="card p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 class="font-semibold text-secondary-900 mb-2">{{ partnerService.activeMeeting()?.partnerName }}</h5>
                      <p class="text-secondary-600 mb-1">{{ partnerService.activeMeeting()?.purpose }}</p>
                      <p class="text-secondary-600 mb-1">{{ partnerService.activeMeeting()?.address }}</p>
                      <p class="text-sm text-secondary-500">
                        Started: {{ partnerService.activeMeeting()?.startDateTime | date:'medium' }}
                      </p>
                    </div>
                    <div>
                      <div class="text-right">
                        <p class="text-2xl font-bold text-primary-600">{{ getMeetingDuration() }}</p>
                        <p class="text-sm text-secondary-500">Duration</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Meeting Actions -->
                <div class="flex flex-wrap gap-4">
                  <button (click)="captureSelfie()" class="btn btn-secondary">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Capture Selfie
                  </button>
                  
                  <button (click)="completeMeeting(partnerService.activeMeeting()!)" class="btn btn-success">
                    Complete Meeting
                  </button>
                </div>
              </div>

              <ng-template #noActiveMeeting>
                <div class="text-center py-8 text-secondary-500">
                  <svg class="mx-auto h-12 w-12 text-secondary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p class="text-lg font-medium text-secondary-900 mb-2">No Active Meeting</p>
                  <p>Start a scheduled meeting to see it here.</p>
                </div>
              </ng-template>
            </div>

            <!-- Analytics Tab -->
            <div *ngIf="activeTab() === 'analytics'" class="space-y-6">
              <h4 class="text-lg font-semibold text-secondary-900">Meeting Analytics</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card p-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-primary-600">{{ getTotalMeetings() }}</p>
                    <p class="text-sm text-secondary-600">Total Meetings</p>
                  </div>
                </div>
                <div class="card p-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-success-600">{{ getCompletedMeetings() }}</p>
                    <p class="text-sm text-secondary-600">Completed</p>
                  </div>
                </div>
                <div class="card p-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-accent-600">{{ getCompletionRate() }}%</p>
                    <p class="text-sm text-secondary-600">Success Rate</p>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
              <div>
                <h5 class="font-medium text-secondary-900 mb-3">Recent Activity</h5>
                <div class="space-y-3">
                  <div 
                    *ngFor="let meeting of getRecentMeetings(); trackBy: trackByMeeting" 
                    class="flex justify-between items-center p-3 bg-secondary-50 rounded-lg"
                  >
                    <div>
                      <p class="font-medium text-secondary-900">{{ meeting.partnerName }}</p>
                      <p class="text-sm text-secondary-600">{{ meeting.purpose }}</p>
                    </div>
                    <div class="text-right">
                      <span 
                        class="status-badge"
                        [class]="getStatusBadgeClass(meeting.status)"
                      >
                        {{ meeting.status }}
                      </span>
                      <p class="text-xs text-secondary-500 mt-1">{{ meeting.meetingDateTime | date:'short' }}</p>
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
    .form-input, .form-select, .form-textarea {
      @apply block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
    }
    .form-checkbox {
      @apply rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500;
    }
    .status-badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }
    .status-scheduled {
      @apply bg-warning-100 text-warning-800;
    }
    .status-completed {
      @apply bg-success-100 text-success-800;
    }
    .status-in-progress {
      @apply bg-primary-100 text-primary-800;
    }
  `]
})
export class PartnerMeetModalComponent {
  partnerService = inject(PartnerService);
  locationService = inject(LocationService);
  modalService = inject(ModalService);

  activeTab = signal('new');
  meetingFilter = 'all';

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

  meetingPurposes: MeetingPurpose[] = [
    'Goal Setting', 'New Contest', 'New Product Training', 'New Business',
    'Renewals', 'Activation', 'Reference Collection', 'FRAR Pendency',
    'Joint Sales Call', 'P20', 'Club Upgradation', 'MDRT/COT/TOT Qualification'
  ];

  tabs = [
    { id: 'new', name: 'New Meeting' },
    { id: 'meetings', name: 'My Meetings' },
    { id: 'active', name: 'Active Meeting' },
    { id: 'analytics', name: 'Analytics' }
  ];

  constructor() {
    // Set default address to current location if available
    const currentLocation = this.locationService.currentLocation();
    if (currentLocation && this.newMeetingData.useStoredAddress) {
      this.newMeetingData.address = currentLocation.location;
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getFilteredPartners(): Partner[] {
    return this.partnerService.getPartnersByCategory('existing')
      .filter(p => !this.newMeetingData.subCategory || p.subCategory === this.newMeetingData.subCategory);
  }

  async scheduleMeeting() {
    try {
      const meetingDateTime = new Date(`${this.newMeetingData.date}T${this.newMeetingData.time}`);
      const currentLocation = this.locationService.currentLocation();
      
      const meetingData = {
        partnerAgentCode: this.newMeetingData.partnerAgentCode || undefined,
        partnerName: this.newMeetingData.partnerAgentCode ? 
          this.partnerService.getPartnerByAgentCode(this.newMeetingData.partnerAgentCode)?.name || '' :
          this.newMeetingData.partnerName,
        meetingDateTime,
        purpose: this.newMeetingData.purpose as MeetingPurpose,
        address: this.newMeetingData.useStoredAddress ? 
          (currentLocation?.location || this.newMeetingData.address) : 
          this.newMeetingData.address,
        remark: this.newMeetingData.remark,
        latitude: this.newMeetingData.useStoredAddress ? currentLocation?.latitude : undefined,
        longitude: this.newMeetingData.useStoredAddress ? currentLocation?.longitude : undefined
      };

      const result = await this.partnerService.createMeeting(meetingData);
      
      if (result.success) {
        alert('Meeting scheduled successfully!');
        this.resetForm();
        this.activeTab.set('meetings');
      } else {
        alert(`Failed to schedule meeting: ${result.message}`);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  }

  resetForm() {
    this.newMeetingData = {
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
  }

  getFilteredMeetings(): Meeting[] {
    const meetings = this.partnerService.meetings();
    
    switch (this.meetingFilter) {
      case 'scheduled':
        return meetings.filter(m => m.status === 'scheduled');
      case 'completed':
        return meetings.filter(m => m.status === 'completed');
      case 'today':
        return this.partnerService.getTodayMeetings();
      default:
        return meetings;
    }
  }

  async startMeeting(meeting: Meeting) {
    const meetingCode = meeting.meetingCode ? 
      prompt('Enter meeting code:') : undefined;
    
    const result = await this.partnerService.startMeeting(meeting.meetingId, meetingCode || undefined);
    
    if (result.success) {
      alert('Meeting started successfully!');
      this.activeTab.set('active');
    } else {
      alert(`Failed to start meeting: ${result.message}`);
    }
  }

  async completeMeeting(meeting: Meeting) {
    const result = await this.partnerService.completeMeeting(meeting.meetingId);
    
    if (result.success) {
      alert('Meeting completed successfully!');
    } else {
      alert(`Failed to complete meeting: ${result.message}`);
    }
  }

  viewMeetingDetails(meeting: Meeting) {
    this.modalService.openModal('meeting-detail', meeting);
  }

  captureSelfie() {
    // Mock selfie capture - in real app, would use camera API
    alert('Selfie capture functionality would integrate with device camera');
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

  getTotalMeetings(): number {
    return this.partnerService.meetings().length;
  }

  getCompletedMeetings(): number {
    return this.partnerService.getMeetingsByStatus('completed').length;
  }

  getCompletionRate(): number {
    const total = this.getTotalMeetings();
    const completed = this.getCompletedMeetings();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getRecentMeetings(): Meeting[] {
    return this.partnerService.meetings()
      .sort((a, b) => new Date(b.meetingDateTime).getTime() - new Date(a.meetingDateTime).getTime())
      .slice(0, 5);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      default: return '';
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const meetingDate = new Date(date);
    return today.toDateString() === meetingDate.toDateString();
  }

  trackByMeeting(index: number, meeting: Meeting): string {
    return meeting.meetingId;
  }
}
