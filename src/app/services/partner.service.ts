import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationService } from './location.service';

export interface Partner {
  agentCode: string;
  name: string;
  category: 'existing' | 'new';
  subCategory?: 'IC' | 'POSP' | 'ASO' | 'IM' | 'RP' | 'EA';
  contactNo?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Meeting {
  meetingId: string;
  flsEmpId: string;
  flsName: string;
  flsAgentCode: string;
  partnerAgentCode?: string;
  partnerName: string;
  meetingDateTime: Date;
  purpose: MeetingPurpose;
  address: string;
  startDateTime?: Date;
  endDateTime?: Date;
  duration?: number; // in minutes
  checkInStatus: 'before' | 'on-time' | 'after';
  meetingCode?: string;
  status: 'scheduled' | 'completed' | 'in-progress';
  remark?: string;
  selfieUrl?: string;
  latitude?: number;
  longitude?: number;
}

export type MeetingPurpose = 
  | 'Goal Setting'
  | 'New Contest'
  | 'New Product Training'
  | 'New Business'
  | 'Renewals'
  | 'Activation'
  | 'Reference Collection'
  | 'FRAR Pendency'
  | 'Joint Sales Call'
  | 'P20'
  | 'Club Upgradation'
  | 'MDRT/COT/TOT Qualification';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private partners$ = new BehaviorSubject<Partner[]>([]);
  private meetings$ = new BehaviorSubject<Meeting[]>([]);
  private activeMeeting$ = new BehaviorSubject<Meeting | null>(null);

  // Signals for reactive UI
  public readonly partners = signal<Partner[]>([]);
  public readonly meetings = signal<Meeting[]>([]);
  public readonly activeMeeting = signal<Meeting | null>(null);

  private meetingDetectionInterval: any;

  constructor(private locationService: LocationService) {
    // Subscribe to observables and update signals
    this.partners$.subscribe(partners => this.partners.set(partners));
    this.meetings$.subscribe(meetings => this.meetings.set(meetings));
    this.activeMeeting$.subscribe(meeting => this.activeMeeting.set(meeting));

    this.initializeMockData();
    this.loadMeetings();
  }

  private initializeMockData() {
    const mockPartners: Partner[] = [
      {
        agentCode: 'PA001',
        name: 'ABC Insurance Agency',
        category: 'existing',
        subCategory: 'IC',
        contactNo: '+1234567890',
        address: '456 Business Ave, Financial District',
        latitude: 40.7589,
        longitude: -73.9851
      },
      {
        agentCode: 'PA002',
        name: 'XYZ Financial Services',
        category: 'existing',
        subCategory: 'POSP',
        contactNo: '+1234567891',
        address: '789 Corporate Blvd, Business Park',
        latitude: 40.7505,
        longitude: -73.9934
      },
      {
        agentCode: 'PA003',
        name: 'Global Investment Corp',
        category: 'existing',
        subCategory: 'ASO',
        contactNo: '+1234567892',
        address: '321 Finance Street, Wall Street',
        latitude: 40.7074,
        longitude: -74.0113
      }
    ];

    this.partners$.next(mockPartners);
    localStorage.setItem('partners', JSON.stringify(mockPartners));
  }

  private loadMeetings() {
    const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    this.meetings$.next(storedMeetings);
  }

  private saveMeetings(meetings: Meeting[]) {
    localStorage.setItem('meetings', JSON.stringify(meetings));
    this.meetings$.next(meetings);
  }

  async createMeeting(meetingData: Partial<Meeting>): Promise<{ success: boolean; meetingId?: string; message?: string }> {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      
      const meetingId = this.generateMeetingId();
      const meeting: Meeting = {
        meetingId,
        flsEmpId: employeeData.empId || '',
        flsName: employeeData.empName || '',
        flsAgentCode: employeeData.empAgentCode || '',
        partnerAgentCode: meetingData.partnerAgentCode,
        partnerName: meetingData.partnerName || '',
        meetingDateTime: meetingData.meetingDateTime || new Date(),
        purpose: meetingData.purpose || 'New Business',
        address: meetingData.address || '',
        checkInStatus: 'before',
        status: 'scheduled',
        remark: meetingData.remark,
        latitude: meetingData.latitude,
        longitude: meetingData.longitude
      };

      // Generate meeting code for new addresses
      if (!meetingData.partnerAgentCode) {
        meeting.meetingCode = this.generateMeetingCode();
        // In real app, send SMS to partner's registered mobile
        console.log(`Meeting code ${meeting.meetingCode} sent to partner's mobile`);
      }

      const meetings = this.meetings();
      meetings.push(meeting);
      this.saveMeetings(meetings);

      return { success: true, meetingId, message: 'Meeting created successfully' };
    } catch (error) {
      console.error('Failed to create meeting:', error);
      return { success: false, message: 'Failed to create meeting' };
    }
  }

  async startMeeting(meetingId: string, meetingCode?: string): Promise<{ success: boolean; message: string }> {
    const meetings = this.meetings();
    const meetingIndex = meetings.findIndex(m => m.meetingId === meetingId);
    
    if (meetingIndex === -1) {
      return { success: false, message: 'Meeting not found' };
    }

    const meeting = meetings[meetingIndex];
    
    // Validate meeting code if required
    if (meeting.meetingCode && meeting.meetingCode !== meetingCode) {
      return { success: false, message: 'Invalid meeting code' };
    }

    // Check if at partner location
    if (meeting.latitude && meeting.longitude) {
      const isAtLocation = this.locationService.isWithinGeofence(
        meeting.latitude,
        meeting.longitude,
        100 // 100 meters radius
      );

      if (!isAtLocation) {
        return { success: false, message: 'Not at partner location' };
      }
    }

    // Update meeting status
    meeting.status = 'in-progress';
    meeting.startDateTime = new Date();
    
    // Determine check-in status
    const scheduledTime = new Date(meeting.meetingDateTime);
    const startTime = new Date();
    const timeDifference = startTime.getTime() - scheduledTime.getTime();
    
    if (timeDifference < -5 * 60 * 1000) { // 5 minutes early
      meeting.checkInStatus = 'before';
    } else if (timeDifference <= 5 * 60 * 1000) { // within 5 minutes
      meeting.checkInStatus = 'on-time';
    } else {
      meeting.checkInStatus = 'after';
    }

    meetings[meetingIndex] = meeting;
    this.saveMeetings(meetings);
    this.activeMeeting$.next(meeting);

    // Start location monitoring
    this.startMeetingLocationMonitoring(meeting);

    return { success: true, message: 'Meeting started successfully' };
  }

  private startMeetingLocationMonitoring(meeting: Meeting) {
    if (this.meetingDetectionInterval) {
      clearInterval(this.meetingDetectionInterval);
    }

    const startTime = new Date();
    
    this.meetingDetectionInterval = setInterval(() => {
      const currentTime = new Date();
      const durationMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      // Check location every 5 minutes
      if (meeting.latitude && meeting.longitude) {
        const isAtLocation = this.locationService.isWithinGeofence(
          meeting.latitude,
          meeting.longitude,
          100
        );

        if (!isAtLocation) {
          this.showNotification('Not at partner location');
          return;
        }

        // Auto-complete if at location for >= 15 minutes
        if (durationMinutes >= 15) {
          this.completeMeeting(meeting.meetingId);
          clearInterval(this.meetingDetectionInterval);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  async completeMeeting(meetingId: string): Promise<{ success: boolean; message: string }> {
    const meetings = this.meetings();
    const meetingIndex = meetings.findIndex(m => m.meetingId === meetingId);
    
    if (meetingIndex === -1) {
      return { success: false, message: 'Meeting not found' };
    }

    const meeting = meetings[meetingIndex];
    meeting.status = 'completed';
    meeting.endDateTime = new Date();
    
    if (meeting.startDateTime) {
      meeting.duration = Math.round((meeting.endDateTime.getTime() - meeting.startDateTime.getTime()) / (1000 * 60));
    }

    meetings[meetingIndex] = meeting;
    this.saveMeetings(meetings);
    this.activeMeeting$.next(null);

    if (this.meetingDetectionInterval) {
      clearInterval(this.meetingDetectionInterval);
    }

    return { success: true, message: 'Meeting completed successfully' };
  }

  async captureSelfie(meetingId: string, imageBlob: Blob): Promise<{ success: boolean; message: string }> {
    try {
      // In a real app, upload to server and get URL
      const selfieUrl = await this.uploadSelfie(imageBlob);
      
      const meetings = this.meetings();
      const meetingIndex = meetings.findIndex(m => m.meetingId === meetingId);
      
      if (meetingIndex !== -1) {
        meetings[meetingIndex].selfieUrl = selfieUrl;
        this.saveMeetings(meetings);
        return { success: true, message: 'Selfie captured successfully' };
      }
      
      return { success: false, message: 'Meeting not found' };
    } catch (error) {
      console.error('Failed to capture selfie:', error);
      return { success: false, message: 'Failed to capture selfie' };
    }
  }

  private async uploadSelfie(imageBlob: Blob): Promise<string> {
    // Mock upload - in real app, upload to server with location metadata
    const currentLocation = this.locationService.currentLocation();
    const metadata = {
      timestamp: new Date().toISOString(),
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      location: currentLocation?.location
    };

    // Create a mock URL for demo
    const timestamp = new Date().getTime();
    return `selfie_${timestamp}.jpg`;
  }

  private generateMeetingId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `MTG_${timestamp}_${random}`;
  }

  private generateMeetingCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getPartnersByCategory(category: 'existing' | 'new'): Partner[] {
    return this.partners().filter(p => p.category === category);
  }

  getPartnerByAgentCode(agentCode: string): Partner | undefined {
    return this.partners().find(p => p.agentCode === agentCode);
  }

  getMeetingsByStatus(status: Meeting['status']): Meeting[] {
    return this.meetings().filter(m => m.status === status);
  }

  getTodayMeetings(): Meeting[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.meetings().filter(m => {
      const meetingDate = new Date(m.meetingDateTime);
      return meetingDate >= today && meetingDate < tomorrow;
    });
  }

  private showNotification(message: string) {
    console.log('Partner Meeting Notification:', message);
  }

  ngOnDestroy() {
    if (this.meetingDetectionInterval) {
      clearInterval(this.meetingDetectionInterval);
    }
  }
}
