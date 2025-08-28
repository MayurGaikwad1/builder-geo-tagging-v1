import { Injectable } from '@angular/core';
import { LocationData } from './location.service';
import { DailyEvent } from './branch.service';
import { Meeting, MeetingPurpose } from './partner.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate mock location data
    this.generateMockLocationHistory();
    
    // Generate mock branch events
    this.generateMockBranchEvents();
    
    // Generate mock meetings
    this.generateMockMeetings();
  }

  private generateMockLocationHistory() {
    const mockLocations: LocationData[] = [];
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
    
    const locations = [
      { name: 'Main Branch Office', lat: 40.7128, lng: -74.0060 },
      { name: 'Regional Office, Business District', lat: 40.7505, lng: -73.9934 },
      { name: 'Customer Office, Tech Park', lat: 40.7589, lng: -73.9851 },
      { name: 'Partner Office, Financial District', lat: 40.7074, lng: -74.0113 },
      { name: 'Home Office Area', lat: 40.7282, lng: -73.7949 }
    ];

    // Generate data for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate 3-8 location points per day
      const dailyCount = Math.floor(Math.random() * 6) + 3;
      
      for (let j = 0; j < dailyCount; j++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const time = new Date(date);
        time.setHours(9 + Math.floor(Math.random() * 10)); // 9 AM to 7 PM
        time.setMinutes(Math.floor(Math.random() * 60));
        
        const mockLocation: LocationData = {
          empId: employeeData.empId || 'EMP001',
          empAgentCode: employeeData.empAgentCode || 'AG001',
          empName: employeeData.empName || 'John Doe',
          reportingManagerId: employeeData.reportingManagerId || 'MGR001',
          reportingManagerName: employeeData.reportingManagerName || 'Jane Smith',
          dateTime: time,
          latitude: location.lat + (Math.random() - 0.5) * 0.01, // Add some variance
          longitude: location.lng + (Math.random() - 0.5) * 0.01,
          location: location.name,
          accuracy: Math.floor(Math.random() * 50) + 10, // 10-60 meters
          userInitiated: Math.random() > 0.7, // 30% user initiated
          department: employeeData.department || 'Sales',
          channel: employeeData.channel || 'Branch'
        };
        
        mockLocations.push(mockLocation);
      }
    }

    // Sort by date (newest first)
    mockLocations.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    
    // Store in localStorage
    localStorage.setItem('locationHistory', JSON.stringify(mockLocations));
  }

  private generateMockBranchEvents() {
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
    
    // Generate events for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      
      // Skip weekends occasionally
      if (date.getDay() === 0 || date.getDay() === 6) {
        if (Math.random() > 0.3) continue; // 70% chance to skip weekends
      }
      
      // Generate daily event with some realistic patterns
      const isWorkDay = Math.random() > 0.1; // 90% attendance rate
      const isOnTime = Math.random() > 0.2; // 80% on-time rate
      const completesActivities = Math.random() > 0.15; // 85% completion rate
      
      const dailyEvent: DailyEvent = {
        empId: employeeData.empId || 'EMP001',
        empAgentCode: employeeData.empAgentCode || 'AG001',
        empName: employeeData.empName || 'John Doe',
        reportingManagerCode: employeeData.reportingManagerId || 'MGR001',
        reportingManagerName: employeeData.reportingManagerName || 'Jane Smith',
        branchCheckIn: {
          dateTime: isWorkDay ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            isOnTime ? 9 : 9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)) : undefined,
          status: isWorkDay ? (Math.random() > 0.1 ? 'successful' : 'system-marked') : 'absent'
        },
        morningHuddle: {
          startDateTime: isWorkDay && completesActivities ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            9, 45 + Math.floor(Math.random() * 15)) : undefined,
          endDateTime: isWorkDay && completesActivities ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            10, 15 + Math.floor(Math.random() * 30)) : undefined,
          status: isWorkDay ? (completesActivities ? 'successful' : 
            (Math.random() > 0.5 ? 'system-marked' : 'not-done')) : 'not-done'
        },
        dayClosure: {
          dateTime: isWorkDay && completesActivities ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            16 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)) : undefined,
          status: isWorkDay && completesActivities ? 'completed' : 'incomplete'
        }
      };
      
      localStorage.setItem(`dailyEvent_${dateKey}`, JSON.stringify(dailyEvent));
    }
  }

  private generateMockMeetings() {
    const mockMeetings: Meeting[] = [];
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
    
    const partners = [
      { agentCode: 'PA001', name: 'ABC Insurance Agency' },
      { agentCode: 'PA002', name: 'XYZ Financial Services' },
      { agentCode: 'PA003', name: 'Global Investment Corp' },
      { agentCode: '', name: 'New Prospect - Tech Startup' },
      { agentCode: '', name: 'New Prospect - Manufacturing Co' },
      { agentCode: 'PA004', name: 'Premium Insurance Solutions' },
      { agentCode: '', name: 'New Prospect - Retail Chain' }
    ];

    const purposes: MeetingPurpose[] = [
      'Goal Setting', 'New Contest', 'New Product Training', 'New Business',
      'Renewals', 'Activation', 'Reference Collection', 'FRAR Pendency',
      'Joint Sales Call', 'P20', 'Club Upgradation', 'MDRT/COT/TOT Qualification'
    ];

    const addresses = [
      '456 Business Ave, Financial District',
      '789 Corporate Blvd, Business Park',
      '321 Finance Street, Wall Street',
      '654 Tech Park Drive, Innovation District',
      '987 Industrial Way, Manufacturing Zone',
      '123 Retail Plaza, Shopping District',
      '555 Premium Tower, Business Center'
    ];

    // Generate meetings for last 60 days and future 30 days
    for (let i = -30; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip some days randomly
      if (Math.random() > 0.4) continue; // 40% chance of having a meeting on any given day
      
      // Generate 1-3 meetings per day when there are meetings
      const meetingCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < meetingCount; j++) {
        const partner = partners[Math.floor(Math.random() * partners.length)];
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];
        const address = addresses[Math.floor(Math.random() * addresses.length)];
        
        const meetingDateTime = new Date(date);
        meetingDateTime.setHours(10 + Math.floor(Math.random() * 7)); // 10 AM to 5 PM
        meetingDateTime.setMinutes(Math.floor(Math.random() * 60));
        
        const isFutureMeeting = i >= 0;
        const isCompleted = !isFutureMeeting && Math.random() > 0.2; // 80% completion rate for past meetings
        const isOnTime = Math.random() > 0.25; // 75% on-time rate
        
        let startDateTime: Date | undefined;
        let endDateTime: Date | undefined;
        let duration: number | undefined;
        
        if (isCompleted) {
          startDateTime = new Date(meetingDateTime);
          if (!isOnTime) {
            startDateTime.setMinutes(startDateTime.getMinutes() + Math.floor(Math.random() * 30)); // Up to 30 min late
          }
          
          const meetingDuration = 15 + Math.floor(Math.random() * 45); // 15-60 minutes
          endDateTime = new Date(startDateTime.getTime() + meetingDuration * 60000);
          duration = meetingDuration;
        }

        const meeting: Meeting = {
          meetingId: `MTG_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          flsEmpId: employeeData.empId || 'EMP001',
          flsName: employeeData.empName || 'John Doe',
          flsAgentCode: employeeData.empAgentCode || 'AG001',
          partnerAgentCode: partner.agentCode || undefined,
          partnerName: partner.name,
          meetingDateTime,
          purpose,
          address,
          startDateTime,
          endDateTime,
          duration,
          checkInStatus: isCompleted ? (isOnTime ? 'on-time' : 'after') : 'before',
          meetingCode: !partner.agentCode ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
          status: isFutureMeeting ? 'scheduled' : (isCompleted ? 'completed' : 'scheduled'),
          remark: Math.random() > 0.7 ? this.getRandomRemark() : undefined,
          selfieUrl: isCompleted && Math.random() > 0.3 ? `selfie_${Date.now()}.jpg` : undefined,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1
        };
        
        mockMeetings.push(meeting);
      }
    }

    // Sort meetings by date
    mockMeetings.sort((a, b) => new Date(a.meetingDateTime).getTime() - new Date(b.meetingDateTime).getTime());
    
    localStorage.setItem('meetings', JSON.stringify(mockMeetings));
  }

  private getRandomRemark(): string {
    const remarks = [
      'Productive discussion about new product features',
      'Client interested in expanding coverage',
      'Follow-up required for pending documentation',
      'Excellent meeting with positive outcomes',
      'Client needs time to consider proposal',
      'Discussed renewal terms and conditions',
      'New business opportunity identified',
      'Training session completed successfully',
      'Partnership goals aligned and confirmed'
    ];
    
    return remarks[Math.floor(Math.random() * remarks.length)];
  }

  // Method to regenerate all mock data
  regenerateAllMockData() {
    this.generateMockLocationHistory();
    this.generateMockBranchEvents();
    this.generateMockMeetings();
  }

  // Method to clear all mock data
  clearAllMockData() {
    localStorage.removeItem('locationHistory');
    localStorage.removeItem('meetings');
    
    // Clear daily events
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      localStorage.removeItem(`dailyEvent_${dateKey}`);
    }
  }
}
