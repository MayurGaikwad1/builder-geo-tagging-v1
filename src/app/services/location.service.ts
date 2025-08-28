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

export interface LocationPermissionStatus {
  supported: boolean;
  state: 'granted' | 'denied' | 'prompt' | 'not-supported' | 'unknown';
  canRequest: boolean;
  browserInstructions: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocation$ = new BehaviorSubject<LocationData | null>(null);
  private trackingActive$ = new BehaviorSubject<boolean>(false);
  private consent$ = new BehaviorSubject<LocationConsent | null>(null);
  private gpsEnabled$ = new BehaviorSubject<boolean>(true);
  private permissionStatus$ = new BehaviorSubject<LocationPermissionStatus | null>(null);

  // Signals for reactive UI
  public readonly currentLocation = signal<LocationData | null>(null);
  public readonly isTracking = signal<boolean>(false);
  public readonly hasConsent = signal<boolean>(false);
  public readonly isGpsEnabled = signal<boolean>(true);
  public readonly permissionStatus = signal<LocationPermissionStatus | null>(null);

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
    this.permissionStatus$.subscribe(status => this.permissionStatus.set(status));

    // Initialize with mock employee data
    this.initializeMockEmployee();

    // Check permission status on startup
    this.checkPermissionStatus();

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

  private async checkPermissionStatus() {
    const status = await this.getDetailedPermissionStatus();
    this.permissionStatus$.next(status);
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
      // First check current permission status
      const permissionStatus = await this.getDetailedPermissionStatus();
      this.permissionStatus$.next(permissionStatus);

      if (!permissionStatus.supported) {
        this.showUserFriendlyError('Geolocation is not supported by this browser', permissionStatus.browserInstructions);
        return false;
      }

      if (!permissionStatus.canRequest) {
        this.showUserFriendlyError('Location permission has been blocked', permissionStatus.browserInstructions);
        return false;
      }

      // Request geolocation permission
      console.log('Requesting location permission...');
      const position = await this.getCurrentPosition();
      console.log('Location permission granted successfully');

      const consent: LocationConsent = {
        granted: true,
        timestamp: new Date(),
        canRevoke: true
      };

      localStorage.setItem('locationConsent', JSON.stringify(consent));
      this.consent$.next(consent);

      // Update permission status
      await this.checkPermissionStatus();

      this.checkGpsAndStartTracking();
      return true;
    } catch (error) {
      const errorMessage = this.getLocationErrorMessage(error);
      const errorDetails = this.getErrorDetails(error);
      
      console.error('Location consent denied:', {
        message: errorMessage,
        details: errorDetails,
        error: error
      });

      // Update permission status after error
      await this.checkPermissionStatus();
      
      this.showUserFriendlyError(errorMessage, this.permissionStatus()?.browserInstructions || '');
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

      console.log('Requesting current position...');
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('Location acquired successfully:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          resolve(position);
        },
        error => {
          const errorMessage = this.getLocationErrorMessage(error);
          const errorDetails = this.getErrorDetails(error);
          console.error('Geolocation error:', {
            message: errorMessage,
            details: errorDetails,
            code: error.code,
            error: error
          });
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
      const errorMessage = this.getLocationErrorMessage(error);
      console.warn('GPS check failed:', errorMessage);
      this.gpsEnabled$.next(false);
      // Don't show error popup for GPS check failures during startup
    }
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
      const errorMessage = this.getLocationErrorMessage(error);
      console.error('Failed to capture location:', errorMessage);
      if (userInitiated) {
        this.showUserFriendlyError(`Failed to capture location: ${errorMessage}`, this.permissionStatus()?.browserInstructions || '');
      }
      this.gpsEnabled$.next(false);
    }
  }

  private getLocationErrorMessage(error: any): string {
    if (error instanceof GeolocationPositionError || (error && error.code !== undefined)) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          return 'Location access denied. Please enable location permissions in your browser.';
        case 2: // POSITION_UNAVAILABLE
          return 'Location information is unavailable. Please check your GPS/network connection.';
        case 3: // TIMEOUT
          return 'Location request timed out. Please try again.';
        default:
          return `Location error: ${error.message || 'Unknown error occurred'}`;
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown location error occurred. Please try again.';
  }

  private getErrorDetails(error: any): any {
    if (error instanceof GeolocationPositionError) {
      return {
        code: error.code,
        message: error.message,
        PERMISSION_DENIED: error.code === 1,
        POSITION_UNAVAILABLE: error.code === 2,
        TIMEOUT: error.code === 3
      };
    }
    return error;
  }

  private showUserFriendlyError(message: string, browserInstructions: string) {
    // Create a more user-friendly notification
    const errorDetails = {
      message,
      browserInstructions,
      timestamp: new Date()
    };

    // Log detailed error for debugging
    console.error('Location Error Details:', errorDetails);

    // Show user-friendly message
    if (typeof window !== 'undefined') {
      // Use a more polite and helpful message
      const userMessage = this.formatUserErrorMessage(message, browserInstructions);
      
      // For now, still use alert but with better formatting
      // In a real app, this would be replaced with a toast/modal service
      setTimeout(() => {
        if (confirm(`${userMessage}\n\nWould you like to see detailed instructions for your browser?`)) {
          alert(browserInstructions);
        }
      }, 100);
    }
  }

  private formatUserErrorMessage(message: string, instructions: string): string {
    return `Location Access Required\n\n${message}\n\nThis app needs location access to provide location-based features like tracking and geo-validation.`;
  }

  // Public method to get detailed permission status
  async getDetailedPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!navigator.geolocation) {
      return {
        supported: false,
        state: 'not-supported',
        canRequest: false,
        browserInstructions: 'Your browser does not support geolocation. Please upgrade to a modern browser.'
      };
    }

    let permissionState: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
    let browserInstructions = this.getBrowserInstructions();

    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        permissionState = permission.state as 'granted' | 'denied' | 'prompt';
        
        if (permission.state === 'denied') {
          browserInstructions = this.getDeniedPermissionInstructions();
        }
      } catch (error) {
        console.warn('Could not query geolocation permission:', error);
      }
    }

    return {
      supported: true,
      state: permissionState,
      canRequest: permissionState !== 'denied',
      browserInstructions
    };
  }

  private getBrowserInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return `Chrome Instructions:
1. Click the location icon (🌐) in the address bar
2. Select "Allow" for location permissions
3. Refresh the page and try again

Alternative:
1. Go to Settings > Privacy and security > Site Settings > Location
2. Find this site and set it to "Allow"`;
    } else if (userAgent.includes('firefox')) {
      return `Firefox Instructions:
1. Click the shield icon in the address bar
2. Turn off "Enhanced Tracking Protection" for this site
3. Click the location icon and select "Allow"
4. Refresh the page and try again`;
    } else if (userAgent.includes('safari')) {
      return `Safari Instructions:
1. Go to Safari > Preferences > Privacy
2. Click "Manage Website Data"
3. Find this site and select "Allow"
4. Or go to Safari > Preferences > Websites > Location
5. Set this site to "Allow"`;
    } else if (userAgent.includes('edge')) {
      return `Edge Instructions:
1. Click the location icon in the address bar
2. Select "Allow" for location permissions
3. Refresh the page and try again

Alternative:
1. Go to Settings > Site permissions > Location
2. Find this site and set it to "Allow"`;
    }

    return `Browser Instructions:
1. Look for a location icon in your browser's address bar
2. Click it and select "Allow" for location permissions
3. Refresh the page and try again

If you don't see a location icon:
1. Check your browser's settings for site permissions
2. Find location permissions and allow this site
3. Refresh the page`;
  }

  private getDeniedPermissionInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return `Location Permission is Blocked - Chrome:

To unblock:
1. Click the lock icon (🔒) in the address bar
2. Click "Site settings"
3. Change Location from "Block" to "Allow"
4. Refresh the page

Or:
1. Go to chrome://settings/content/location
2. Find this site in the blocked list
3. Remove it or change to allow
4. Refresh the page`;
    } else if (userAgent.includes('firefox')) {
      return `Location Permission is Blocked - Firefox:

To unblock:
1. Click the shield icon in the address bar
2. Click "Turn off Blocking for this session"
3. Refresh the page and allow location when prompted

Or:
1. Type about:preferences#privacy in address bar
2. Scroll to Permissions > Location
3. Click "Settings" and remove this site from blocked list
4. Refresh the page`;
    }

    return `Location Permission is Blocked:

To unblock in your browser:
1. Look for a blocked/crossed-out location icon in the address bar
2. Click it and change the setting to "Allow"
3. Refresh the page

Or check your browser's privacy/security settings:
1. Find site permissions or content settings
2. Look for location permissions
3. Remove this site from the blocked list or change to allow
4. Refresh the page`;
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
      if (!navigator.geolocation) {
        this.showUserFriendlyError('Geolocation is not supported by this browser', 'Please upgrade to a modern browser that supports location services.');
        return null;
      }

      console.log('Manual location capture requested');
      await this.captureLocation(true);
      const location = this.currentLocation();
      
      if (location) {
        console.log('Manual location capture successful');
        // Show success message instead of error
        if (typeof window !== 'undefined') {
          // Could replace with a toast notification
          console.log('Location captured successfully:', location.location);
        }
      }
      
      return location;
    } catch (error) {
      const errorMessage = this.getLocationErrorMessage(error);
      console.error('Manual location capture failed:', errorMessage);
      this.showUserFriendlyError(`Failed to capture location: ${errorMessage}`, this.permissionStatus()?.browserInstructions || '');
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

  getPermissionStatusObservable(): Observable<LocationPermissionStatus | null> {
    return this.permissionStatus$.asObservable();
  }

  // Public method to refresh permission status
  async refreshPermissionStatus(): Promise<LocationPermissionStatus> {
    const status = await this.getDetailedPermissionStatus();
    this.permissionStatus$.next(status);
    return status;
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
