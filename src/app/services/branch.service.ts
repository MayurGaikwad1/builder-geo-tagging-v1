import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { LocationService } from './location.service';

export interface Branch {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
}

export interface TileState {
  id: string;
  name: string;
  status: 'visible' | 'clicked' | 'started' | 'completed' | 'incomplete' | 'system-marked' | 'absent';
  isVisible: boolean;
  isEnabled: boolean;
  timeWindow: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  lastUpdated?: Date;
  completedAt?: Date;
}

export interface DailyEvent {
  empId: string;
  empAgentCode: string;
  empName: string;
  reportingManagerCode: string;
  reportingManagerName: string;
  branchCheckIn?: {
    dateTime?: Date;
    status: 'successful' | 'absent' | 'system-marked';
  };
  morningHuddle?: {
    startDateTime?: Date;
    endDateTime?: Date;
    status: 'successful' | 'system-marked' | 'not-done' | 'incomplete';
  };
  dayClosure?: {
    dateTime?: Date;
    status: 'completed' | 'incomplete';
  };
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private assignedBranch$ = new BehaviorSubject<Branch | null>(null);
  private tiles$ = new BehaviorSubject<TileState[]>([]);
  private dailyEvent$ = new BehaviorSubject<DailyEvent | null>(null);

  // Signals for reactive UI
  public readonly assignedBranch = signal<Branch | null>(null);
  public readonly tiles = signal<TileState[]>([]);
  public readonly todayEvent = signal<DailyEvent | null>(null);

  private autoDetectionIntervals: { [key: string]: any } = {};

  constructor(private locationService: LocationService) {
    // Subscribe to observables and update signals
    this.assignedBranch$.subscribe(branch => this.assignedBranch.set(branch));
    this.tiles$.subscribe(tiles => this.tiles.set(tiles));
    this.dailyEvent$.subscribe(event => this.todayEvent.set(event));

    this.initializeBranchData();
    this.initializeTiles();
    this.setupAutoDetection();
  }

  private initializeBranchData() {
    // Mock branch data
    const mockBranch: Branch = {
      id: 'BR001',
      name: 'Main Branch Office',
      address: '123 Business Street, Downtown',
      latitude: 40.7128, // Mock NYC coordinates
      longitude: -74.0060,
      geofenceRadius: 100 // meters
    };

    this.assignedBranch$.next(mockBranch);
    localStorage.setItem('assignedBranch', JSON.stringify(mockBranch));
  }

  private initializeTiles() {
    const today = new Date().toDateString();
    const storedEvent = localStorage.getItem(`dailyEvent_${today}`);
    
    let dailyEvent: DailyEvent;
    if (storedEvent) {
      dailyEvent = JSON.parse(storedEvent);
    } else {
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      dailyEvent = {
        empId: employeeData.empId || '',
        empAgentCode: employeeData.empAgentCode || '',
        empName: employeeData.empName || '',
        reportingManagerCode: employeeData.reportingManagerId || '',
        reportingManagerName: employeeData.reportingManagerName || '',
        branchCheckIn: { status: 'absent' },
        morningHuddle: { status: 'not-done' },
        dayClosure: { status: 'incomplete' }
      };
    }

    this.dailyEvent$.next(dailyEvent);

    const tiles: TileState[] = [
      {
        id: 'branch-checkin',
        name: 'Branch Check-in',
        status: dailyEvent.branchCheckIn?.status === 'successful' ? 'completed' : 'visible',
        isVisible: this.isTimeWindowActive('08:45', '09:45'),
        isEnabled: dailyEvent.branchCheckIn?.status !== 'successful',
        timeWindow: { start: '08:45', end: '09:45' },
        lastUpdated: dailyEvent.branchCheckIn?.dateTime,
        completedAt: dailyEvent.branchCheckIn?.dateTime
      },
      {
        id: 'morning-huddle',
        name: 'Morning Huddle',
        status: dailyEvent.morningHuddle?.status === 'successful' ? 'completed' : 'visible',
        isVisible: this.isTimeWindowActive('09:45', '10:30'),
        isEnabled: dailyEvent.morningHuddle?.status !== 'successful',
        timeWindow: { start: '09:45', end: '10:30' },
        lastUpdated: dailyEvent.morningHuddle?.startDateTime,
        completedAt: dailyEvent.morningHuddle?.endDateTime
      },
      {
        id: 'day-closure',
        name: 'Day Closure',
        status: dailyEvent.dayClosure?.status === 'completed' ? 'completed' : 'visible',
        isVisible: this.isTimeWindowActive('16:00', '18:00'),
        isEnabled: dailyEvent.dayClosure?.status !== 'completed',
        timeWindow: { start: '16:00', end: '18:00' },
        lastUpdated: dailyEvent.dayClosure?.dateTime,
        completedAt: dailyEvent.dayClosure?.dateTime
      }
    ];

    this.tiles$.next(tiles);
  }

  private isTimeWindowActive(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= startTime && currentTime <= endTime;
  }

  private setupAutoDetection() {
    // Branch Check-in auto-detection (09:15-09:45, every 5 minutes)
    this.autoDetectionIntervals['branch-checkin'] = setInterval(() => {
      this.autoDetectBranchCheckIn();
    }, 5 * 60 * 1000); // 5 minutes

    // Morning Huddle auto-detection (09:45-10:00, every 5 minutes for start, then every 10 minutes)
    this.autoDetectionIntervals['morning-huddle-start'] = setInterval(() => {
      this.autoDetectMorningHuddleStart();
    }, 5 * 60 * 1000); // 5 minutes

    this.autoDetectionIntervals['morning-huddle-completion'] = setInterval(() => {
      this.autoDetectMorningHuddleCompletion();
    }, 10 * 60 * 1000); // 10 minutes

    // Day Closure auto-detection (16:00-18:00, every 30 minutes)
    this.autoDetectionIntervals['day-closure'] = setInterval(() => {
      this.autoDetectDayClosure();
    }, 30 * 60 * 1000); // 30 minutes
  }

  private async autoDetectBranchCheckIn() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime >= '09:15' && currentTime <= '09:45') {
      const dailyEvent = this.todayEvent();
      if (dailyEvent && dailyEvent.branchCheckIn?.status === 'absent') {
        const branch = this.assignedBranch();
        if (branch && this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
          await this.markBranchCheckInSuccessful(true);
          this.showNotification('Branch check-in successful for the day on ' + new Date().toLocaleString());
        }
      }
    }
  }

  private async autoDetectMorningHuddleStart() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime >= '09:45' && currentTime <= '10:00') {
      const dailyEvent = this.todayEvent();
      if (dailyEvent && 
          dailyEvent.branchCheckIn?.status === 'successful' && 
          dailyEvent.morningHuddle?.status === 'not-done') {
        
        const branch = this.assignedBranch();
        if (branch && this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
          await this.startMorningHuddle(true);
          this.showNotification('Morning huddle started at ' + new Date().toLocaleString() + ' successfully');
        }
      }
    }
  }

  private async autoDetectMorningHuddleCompletion() {
    const dailyEvent = this.todayEvent();
    if (dailyEvent && 
        dailyEvent.morningHuddle?.status === 'system-marked' && 
        dailyEvent.morningHuddle?.startDateTime) {
      
      const startTime = new Date(dailyEvent.morningHuddle.startDateTime);
      const now = new Date();
      const durationMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
      
      if (durationMinutes >= 30) {
        const branch = this.assignedBranch();
        if (branch && this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
          await this.completeMorningHuddle(true);
        } else {
          await this.markMorningHuddleIncomplete();
        }
      }
    }
  }

  private async autoDetectDayClosure() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime >= '16:00' && currentTime <= '18:00') {
      const dailyEvent = this.todayEvent();
      if (dailyEvent && 
          dailyEvent.branchCheckIn?.status === 'successful' && 
          dailyEvent.dayClosure?.status === 'incomplete') {
        
        const branch = this.assignedBranch();
        if (branch && this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
          await this.completeDayClosure(true);
          this.showNotification('Day closure completed successfully');
        }
      }
    }
  }

  async performBranchCheckIn(): Promise<{ success: boolean; message: string }> {
    const branch = this.assignedBranch();
    if (!branch) {
      return { success: false, message: 'No branch assigned' };
    }

    if (this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
      await this.markBranchCheckInSuccessful(false);
      return { success: true, message: 'Branch Check-in Successful for the Day' };
    } else {
      return { success: false, message: 'You are not at branch' };
    }
  }

  async performMorningHuddle(): Promise<{ success: boolean; message: string }> {
    const branch = this.assignedBranch();
    if (!branch) {
      return { success: false, message: 'No branch assigned' };
    }

    if (this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
      await this.startMorningHuddle(false);
      return { success: true, message: 'Morning huddle started' };
    } else {
      return { success: false, message: 'You are not in branch' };
    }
  }

  async performDayClosure(): Promise<{ success: boolean; message: string }> {
    const branch = this.assignedBranch();
    if (!branch) {
      return { success: false, message: 'No branch assigned' };
    }

    if (this.locationService.isWithinGeofence(branch.latitude, branch.longitude, branch.geofenceRadius)) {
      await this.completeDayClosure(false);
      return { success: true, message: 'Day closure done' };
    } else {
      return { success: false, message: 'You are not at branch' };
    }
  }

  private async markBranchCheckInSuccessful(isSystemMarked: boolean) {
    const dailyEvent = this.todayEvent();
    if (dailyEvent) {
      dailyEvent.branchCheckIn = {
        dateTime: new Date(),
        status: isSystemMarked ? 'system-marked' : 'successful'
      };

      this.saveDailyEvent(dailyEvent);
      this.updateTileStatus('branch-checkin', 'completed');
    }
  }

  private async startMorningHuddle(isSystemMarked: boolean) {
    const dailyEvent = this.todayEvent();
    if (dailyEvent) {
      dailyEvent.morningHuddle = {
        startDateTime: new Date(),
        status: isSystemMarked ? 'system-marked' : 'successful'
      };

      this.saveDailyEvent(dailyEvent);
      this.updateTileStatus('morning-huddle', 'started');
    }
  }

  private async completeMorningHuddle(isSystemMarked: boolean) {
    const dailyEvent = this.todayEvent();
    if (dailyEvent && dailyEvent.morningHuddle) {
      dailyEvent.morningHuddle.endDateTime = new Date();
      dailyEvent.morningHuddle.status = 'successful';

      this.saveDailyEvent(dailyEvent);
      this.updateTileStatus('morning-huddle', 'completed');
    }
  }

  private async markMorningHuddleIncomplete() {
    const dailyEvent = this.todayEvent();
    if (dailyEvent && dailyEvent.morningHuddle) {
      dailyEvent.morningHuddle.status = 'incomplete';

      this.saveDailyEvent(dailyEvent);
      this.updateTileStatus('morning-huddle', 'incomplete');
    }
  }

  private async completeDayClosure(isSystemMarked: boolean) {
    const dailyEvent = this.todayEvent();
    if (dailyEvent) {
      dailyEvent.dayClosure = {
        dateTime: new Date(),
        status: 'completed'
      };

      this.saveDailyEvent(dailyEvent);
      this.updateTileStatus('day-closure', 'completed');
    }
  }

  private updateTileStatus(tileId: string, status: TileState['status']) {
    const tiles = this.tiles();
    const tileIndex = tiles.findIndex(t => t.id === tileId);
    if (tileIndex !== -1) {
      tiles[tileIndex].status = status;
      tiles[tileIndex].isEnabled = status !== 'completed';
      tiles[tileIndex].lastUpdated = new Date();
      if (status === 'completed') {
        tiles[tileIndex].completedAt = new Date();
      }
      this.tiles$.next([...tiles]);
    }
  }

  private saveDailyEvent(dailyEvent: DailyEvent) {
    const today = new Date().toDateString();
    localStorage.setItem(`dailyEvent_${today}`, JSON.stringify(dailyEvent));
    this.dailyEvent$.next(dailyEvent);
  }

  private showNotification(message: string) {
    // In a real app, this would show push notifications
    console.log('Notification:', message);
    // You could also dispatch custom events here for the UI to listen to
  }

  getTilesObservable(): Observable<TileState[]> {
    return this.tiles$.asObservable();
  }

  getDailyEventObservable(): Observable<DailyEvent | null> {
    return this.dailyEvent$.asObservable();
  }

  ngOnDestroy() {
    // Clean up intervals
    Object.values(this.autoDetectionIntervals).forEach(interval => {
      if (interval) {
        clearInterval(interval);
      }
    });
  }
}
