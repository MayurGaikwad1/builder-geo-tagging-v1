import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface LocationData {
  empId: string;
  empAgentCode: string;
  empName: string;
  reportingManagerId: string;
  reportingManagerName: string;
  dateTime: Date;
  latitude: number;
  longitude: number;
  location: string;
  accuracy: number;
  userInitiated: boolean;
  department: string;
  channel: string;
}

export interface LocationConsent {
  granted: boolean;
  timestamp: Date;
  canRevoke: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocation$ = new BehaviorSubject<LocationData | null>(null);
  private trackingActive$ = new BehaviorSubject<boolean>(false);
  private consent$ = new BehaviorSubject<LocationConsent | null>(null);
  private gpsEnabled$ = new BehaviorSubject<boolean>(true);

  // Signals for reactive UI
  public readonly currentLocation = signal<LocationData | null>(null);
  public readonly isTracking = signal<boolean>(false);
  public readonly hasConsent = signal<boolean>(false);
  public readonly isGpsEnabled = signal<boolean>(true);

  private trackingInterval: any;
  private trackingCadence = 60 * 60 * 1000; // 1 hour in milliseconds
  private trackingStartTime = 9; // 09:00
  private trackingEndTime = 21; // 21:00

  constructor() {
    // Subscribe to observables and update signals
    this.currentLocation$.subscribe(location => this.currentLocation.set(location));
    this.trackingActive$.subscribe(active => this.isTracking.set(active));
    this.consent$.subscribe(consent => this.hasConsent.set(consent?.granted ?? false));
    this.gpsEnabled$.subscribe(enabled => this.isGpsEnabled.set(enabled));

    // Initialize with mock employee data
    this.initializeMockEmployee();

    // Check for existing consent
    this.checkExistingConsent();
  }

  private initializeMockEmployee() {
    // Mock employee data for demo
    const mockEmployee = {
      empId: 'EMP001',
      empAgentCode: 'AG001',
      empName: 'John Doe',
      reportingManagerId: 'MGR001',
      reportingManagerName: 'Jane Smith',
      department: 'Sales',
      channel: 'Branch'
    };
    
    localStorage.setItem('employeeData', JSON.stringify(mockEmployee));
  }

  private checkExistingConsent() {
    const storedConsent = localStorage.getItem('locationConsent');
    if (storedConsent) {
      const consent: LocationConsent = JSON.parse(storedConsent);
      this.consent$.next(consent);
      if (consent.granted) {
        this.checkGpsAndStartTracking();
      }
    }
  }

  async requestLocationConsent(): Promise<boolean> {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        this.showLocationError('Geolocation is not supported by this browser');
        return false;
      }

      // Request geolocation permission
      const position = await this.getCurrentPosition();

      const consent: LocationConsent = {
        granted: true,
        timestamp: new Date(),
        canRevoke: true
      };

      localStorage.setItem('locationConsent', JSON.stringify(consent));
      this.consent$.next(consent);

      this.checkGpsAndStartTracking();
      return true;
    } catch (error) {
      const errorMessage = this.getLocationErrorMessage(error);
      console.error('Location consent denied:', errorMessage);
      this.showLocationError(errorMessage);
      return false;
    }
  }

  revokeConsent() {
    const consent: LocationConsent = {
      granted: false,
      timestamp: new Date(),
      canRevoke: true
    };
    
    localStorage.setItem('locationConsent', JSON.stringify(consent));
    this.consent$.next(consent);
    this.stopTracking();
  }

  private async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('Location acquired successfully:', position);
          resolve(position);
        },
        error => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: false, // Changed to false for better compatibility
          timeout: 15000, // Increased timeout
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  private async checkGpsAndStartTracking() {
    try {
      // Check if GPS is available
      await this.getCurrentPosition();
      this.gpsEnabled$.next(true);
      this.startTracking();
    } catch (error) {
      this.gpsEnabled$.next(false);
      this.showGpsPrompt();
    }
  }

  private showGpsPrompt() {
    // In a real app, this would show a system dialog
    console.log('GPS is disabled. Please enable GPS to continue location tracking.');
  }

  private startTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingActive$.next(true);
    
    // Capture initial location
    this.captureLocation(true);

    // Set up interval for automated tracking
    this.trackingInterval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Only track during working hours
      if (currentHour >= this.trackingStartTime && currentHour <= this.trackingEndTime) {
        this.captureLocation(false);
      }
    }, this.trackingCadence);
  }

  private stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.trackingActive$.next(false);
  }

  private async captureLocation(userInitiated: boolean = false) {
    try {
      const position = await this.getCurrentPosition();
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      
      const locationData: LocationData = {
        ...employeeData,
        dateTime: new Date(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        location: await this.reverseGeocode(position.coords.latitude, position.coords.longitude),
        accuracy: position.coords.accuracy,
        userInitiated
      };

      this.currentLocation$.next(locationData);
      this.storeLocationData(locationData);
      
    } catch (error) {
      console.error('Failed to capture location:', error);
      this.gpsEnabled$.next(false);
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Mock reverse geocoding - in real app, use Google Maps API
    const mockLocations = [
      'Main Branch Office, Downtown',
      'Regional Office, Business District',
      'Customer Office, Tech Park',
      'Home Office Area'
    ];
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  }

  private storeLocationData(locationData: LocationData) {
    const stored = JSON.parse(localStorage.getItem('locationHistory') || '[]');
    stored.push(locationData);
    
    // Keep only last 100 entries for demo
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100);
    }
    
    localStorage.setItem('locationHistory', JSON.stringify(stored));
  }

  async manualLocationCapture(): Promise<LocationData | null> {
    try {
      await this.captureLocation(true);
      return this.currentLocation();
    } catch (error) {
      console.error('Manual location capture failed:', error);
      return null;
    }
  }

  getLocationHistory(): LocationData[] {
    return JSON.parse(localStorage.getItem('locationHistory') || '[]');
  }

  getCurrentLocationObservable(): Observable<LocationData | null> {
    return this.currentLocation$.asObservable();
  }

  getTrackingStatusObservable(): Observable<boolean> {
    return this.trackingActive$.asObservable();
  }

  isWithinGeofence(targetLat: number, targetLng: number, radiusMeters: number = 100): boolean {
    const current = this.currentLocation();
    if (!current) return false;

    const distance = this.calculateDistance(
      current.latitude,
      current.longitude,
      targetLat,
      targetLng
    );

    return distance <= radiusMeters;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}
