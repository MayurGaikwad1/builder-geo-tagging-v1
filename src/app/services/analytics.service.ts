import { Injectable, signal } from '@angular/core';
import { LocationService, LocationData } from './location.service';
import { BranchService, DailyEvent, TileState } from './branch.service';
import { PartnerService, Meeting } from './partner.service';
import { MockDataService } from './mock-data.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface LocationAnalytics {
  totalLocations: number;
  dailyAverage: number;
  accuracyAverage: number;
  userInitiatedCount: number;
  systemInitiatedCount: number;
  locationsByDay: { [key: string]: number };
  locationsByHour: { [key: string]: number };
  topLocations: { location: string; count: number }[];
}

export interface BranchAnalytics {
  checkInRate: number;
  huddleCompletionRate: number;
  closureCompletionRate: number;
  onTimeRate: number;
  avgHuddleDuration: number;
  complianceScore: number;
  dailyStats: { [key: string]: { checkIn: boolean; huddle: boolean; closure: boolean } };
}

export interface MeetingAnalytics {
  totalMeetings: number;
  completedMeetings: number;
  completionRate: number;
  avgDuration: number;
  onTimeRate: number;
  topPurposes: { purpose: string; count: number }[];
  meetingsByStatus: { [key: string]: number };
  meetingsByCheckIn: { [key: string]: number };
  monthlyTrend: { [key: string]: number };
}

export interface ComplianceMetrics {
  overallScore: number;
  locationCompliance: number;
  branchCompliance: number;
  meetingCompliance: number;
  policyAdherence: number;
  riskScore: 'low' | 'medium' | 'high';
  violations: string[];
  recommendations: string[];
}

export interface PerformanceKPIs {
  activityScore: number;
  efficiencyScore: number;
  punctualityScore: number;
  geoComplianceScore: number;
  meetingEffectivenessScore: number;
  overallPerformanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  trends: {
    daily: { [key: string]: number };
    weekly: { [key: string]: number };
    monthly: { [key: string]: number };
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // Signals for reactive UI
  public readonly locationAnalytics = signal<LocationAnalytics | null>(null);
  public readonly branchAnalytics = signal<BranchAnalytics | null>(null);
  public readonly meetingAnalytics = signal<MeetingAnalytics | null>(null);
  public readonly complianceMetrics = signal<ComplianceMetrics | null>(null);
  public readonly performanceKPIs = signal<PerformanceKPIs | null>(null);
  public readonly isLoading = signal<boolean>(false);

  constructor(
    private locationService: LocationService,
    private branchService: BranchService,
    private partnerService: PartnerService
  ) {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    // Initialize with last 30 days data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.generateAnalytics({ startDate, endDate });
  }

  async generateAnalytics(dateRange: DateRange) {
    this.isLoading.set(true);
    
    try {
      // Get data from services
      const locationHistory = this.getLocationDataInRange(dateRange);
      const branchHistory = this.getBranchDataInRange(dateRange);
      const meetingHistory = this.getMeetingDataInRange(dateRange);

      // Generate analytics
      const locationAnalytics = this.generateLocationAnalytics(locationHistory);
      const branchAnalytics = this.generateBranchAnalytics(branchHistory);
      const meetingAnalytics = this.generateMeetingAnalytics(meetingHistory);
      const complianceMetrics = this.generateComplianceMetrics(locationHistory, branchHistory, meetingHistory);
      const performanceKPIs = this.generatePerformanceKPIs(locationAnalytics, branchAnalytics, meetingAnalytics, complianceMetrics);

      // Update signals
      this.locationAnalytics.set(locationAnalytics);
      this.branchAnalytics.set(branchAnalytics);
      this.meetingAnalytics.set(meetingAnalytics);
      this.complianceMetrics.set(complianceMetrics);
      this.performanceKPIs.set(performanceKPIs);
    } catch (error) {
      console.error('Failed to generate analytics:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getLocationDataInRange(dateRange: DateRange): LocationData[] {
    const history = this.locationService.getLocationHistory();
    return history.filter(loc => {
      const locDate = new Date(loc.dateTime);
      return locDate >= dateRange.startDate && locDate <= dateRange.endDate;
    });
  }

  private getBranchDataInRange(dateRange: DateRange): DailyEvent[] {
    const events: DailyEvent[] = [];
    const current = new Date(dateRange.startDate);
    
    while (current <= dateRange.endDate) {
      const dateKey = current.toDateString();
      const stored = localStorage.getItem(`dailyEvent_${dateKey}`);
      if (stored) {
        events.push(JSON.parse(stored));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return events;
  }

  private getMeetingDataInRange(dateRange: DateRange): Meeting[] {
    const meetings = this.partnerService.meetings();
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.meetingDateTime);
      return meetingDate >= dateRange.startDate && meetingDate <= dateRange.endDate;
    });
  }

  private generateLocationAnalytics(locations: LocationData[]): LocationAnalytics {
    const totalLocations = locations.length;
    const days = Math.max(1, Math.ceil((new Date().getTime() - new Date(locations[0]?.dateTime || new Date()).getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalLocations / days;
    
    const accuracySum = locations.reduce((sum, loc) => sum + loc.accuracy, 0);
    const accuracyAverage = accuracySum / totalLocations || 0;
    
    const userInitiatedCount = locations.filter(loc => loc.userInitiated).length;
    const systemInitiatedCount = totalLocations - userInitiatedCount;

    // Group by day
    const locationsByDay: { [key: string]: number } = {};
    const locationsByHour: { [key: string]: number } = {};
    const locationCounts: { [key: string]: number } = {};

    locations.forEach(loc => {
      const date = new Date(loc.dateTime);
      const dayKey = date.toISOString().split('T')[0];
      const hourKey = date.getHours().toString();
      
      locationsByDay[dayKey] = (locationsByDay[dayKey] || 0) + 1;
      locationsByHour[hourKey] = (locationsByHour[hourKey] || 0) + 1;
      locationCounts[loc.location] = (locationCounts[loc.location] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLocations,
      dailyAverage,
      accuracyAverage,
      userInitiatedCount,
      systemInitiatedCount,
      locationsByDay,
      locationsByHour,
      topLocations
    };
  }

  private generateBranchAnalytics(events: DailyEvent[]): BranchAnalytics {
    const totalDays = events.length;
    if (totalDays === 0) {
      return {
        checkInRate: 0,
        huddleCompletionRate: 0,
        closureCompletionRate: 0,
        onTimeRate: 0,
        avgHuddleDuration: 0,
        complianceScore: 0,
        dailyStats: {}
      };
    }

    const checkInSuccessful = events.filter(e => e.branchCheckIn?.status === 'successful' || e.branchCheckIn?.status === 'system-marked').length;
    const huddleCompleted = events.filter(e => e.morningHuddle?.status === 'successful').length;
    const closureCompleted = events.filter(e => e.dayClosure?.status === 'completed').length;
    
    const checkInRate = (checkInSuccessful / totalDays) * 100;
    const huddleCompletionRate = (huddleCompleted / totalDays) * 100;
    const closureCompletionRate = (closureCompleted / totalDays) * 100;

    // Calculate huddle duration
    const huddleDurations = events
      .filter(e => e.morningHuddle?.startDateTime && e.morningHuddle?.endDateTime)
      .map(e => {
        const start = new Date(e.morningHuddle!.startDateTime!);
        const end = new Date(e.morningHuddle!.endDateTime!);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });
    
    const avgHuddleDuration = huddleDurations.length > 0 
      ? huddleDurations.reduce((sum, duration) => sum + duration, 0) / huddleDurations.length 
      : 0;

    // On-time rate (simplified - checking if activities completed in time windows)
    const onTimeActivities = events.filter(e => 
      (e.branchCheckIn?.status === 'successful' || e.branchCheckIn?.status === 'system-marked') &&
      (e.morningHuddle?.status === 'successful') &&
      (e.dayClosure?.status === 'completed')
    ).length;
    const onTimeRate = (onTimeActivities / totalDays) * 100;

    const complianceScore = (checkInRate + huddleCompletionRate + closureCompletionRate + onTimeRate) / 4;

    // Daily stats
    const dailyStats: { [key: string]: { checkIn: boolean; huddle: boolean; closure: boolean } } = {};
    events.forEach(event => {
      const key = new Date().toISOString().split('T')[0]; // Simplified for demo
      dailyStats[key] = {
        checkIn: event.branchCheckIn?.status === 'successful' || event.branchCheckIn?.status === 'system-marked',
        huddle: event.morningHuddle?.status === 'successful',
        closure: event.dayClosure?.status === 'completed'
      };
    });

    return {
      checkInRate,
      huddleCompletionRate,
      closureCompletionRate,
      onTimeRate,
      avgHuddleDuration,
      complianceScore,
      dailyStats
    };
  }

  private generateMeetingAnalytics(meetings: Meeting[]): MeetingAnalytics {
    const totalMeetings = meetings.length;
    const completedMeetings = meetings.filter(m => m.status === 'completed').length;
    const completionRate = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

    // Average duration
    const durations = meetings.filter(m => m.duration).map(m => m.duration!);
    const avgDuration = durations.length > 0 ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length : 0;

    // On-time rate
    const onTimeMeetings = meetings.filter(m => m.checkInStatus === 'on-time').length;
    const onTimeRate = totalMeetings > 0 ? (onTimeMeetings / totalMeetings) * 100 : 0;

    // Top purposes
    const purposeCounts: { [key: string]: number } = {};
    meetings.forEach(m => {
      purposeCounts[m.purpose] = (purposeCounts[m.purpose] || 0) + 1;
    });
    const topPurposes = Object.entries(purposeCounts)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Meetings by status
    const meetingsByStatus: { [key: string]: number } = {};
    meetings.forEach(m => {
      meetingsByStatus[m.status] = (meetingsByStatus[m.status] || 0) + 1;
    });

    // Meetings by check-in status
    const meetingsByCheckIn: { [key: string]: number } = {};
    meetings.forEach(m => {
      meetingsByCheckIn[m.checkInStatus] = (meetingsByCheckIn[m.checkInStatus] || 0) + 1;
    });

    // Monthly trend (simplified)
    const monthlyTrend: { [key: string]: number } = {};
    meetings.forEach(m => {
      const month = new Date(m.meetingDateTime).toISOString().slice(0, 7);
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    return {
      totalMeetings,
      completedMeetings,
      completionRate,
      avgDuration,
      onTimeRate,
      topPurposes,
      meetingsByStatus,
      meetingsByCheckIn,
      monthlyTrend
    };
  }

  private generateComplianceMetrics(locations: LocationData[], events: DailyEvent[], meetings: Meeting[]): ComplianceMetrics {
    // Location compliance (accuracy and frequency)
    const avgAccuracy = locations.length > 0 ? locations.reduce((sum, loc) => sum + loc.accuracy, 0) / locations.length : 0;
    const locationCompliance = Math.min(100, (avgAccuracy / 50) * 100); // Assuming 50m is ideal accuracy

    // Branch compliance
    const branchAnalytics = this.generateBranchAnalytics(events);
    const branchCompliance = branchAnalytics.complianceScore;

    // Meeting compliance
    const meetingAnalytics = this.generateMeetingAnalytics(meetings);
    const meetingCompliance = (meetingAnalytics.completionRate + meetingAnalytics.onTimeRate) / 2;

    // Policy adherence (simplified scoring)
    const policyAdherence = (locationCompliance + branchCompliance + meetingCompliance) / 3;

    const overallScore = policyAdherence;

    // Risk assessment
    let riskScore: 'low' | 'medium' | 'high' = 'low';
    if (overallScore < 60) riskScore = 'high';
    else if (overallScore < 80) riskScore = 'medium';

    // Violations and recommendations
    const violations: string[] = [];
    const recommendations: string[] = [];

    if (locationCompliance < 70) {
      violations.push('Poor location accuracy');
      recommendations.push('Enable high-accuracy GPS settings');
    }
    if (branchCompliance < 80) {
      violations.push('Inconsistent branch activities');
      recommendations.push('Set up reminders for daily activities');
    }
    if (meetingCompliance < 75) {
      violations.push('Low meeting completion rate');
      recommendations.push('Improve meeting scheduling and follow-up');
    }

    return {
      overallScore,
      locationCompliance,
      branchCompliance,
      meetingCompliance,
      policyAdherence,
      riskScore,
      violations,
      recommendations
    };
  }

  private generatePerformanceKPIs(
    locationAnalytics: LocationAnalytics,
    branchAnalytics: BranchAnalytics,
    meetingAnalytics: MeetingAnalytics,
    complianceMetrics: ComplianceMetrics
  ): PerformanceKPIs {
    // Activity Score (based on location tracking and meeting frequency)
    const activityScore = Math.min(100, (locationAnalytics.dailyAverage * 10) + (meetingAnalytics.totalMeetings * 2));

    // Efficiency Score (based on completion rates)
    const efficiencyScore = (branchAnalytics.complianceScore + meetingAnalytics.completionRate) / 2;

    // Punctuality Score
    const punctualityScore = (branchAnalytics.onTimeRate + meetingAnalytics.onTimeRate) / 2;

    // Geo-compliance Score
    const geoComplianceScore = complianceMetrics.locationCompliance;

    // Meeting Effectiveness Score
    const meetingEffectivenessScore = (meetingAnalytics.completionRate + meetingAnalytics.onTimeRate + 
      Math.min(100, meetingAnalytics.avgDuration > 0 ? (30 / meetingAnalytics.avgDuration) * 100 : 0)) / 3;

    // Overall Performance Grade
    const averageScore = (activityScore + efficiencyScore + punctualityScore + geoComplianceScore + meetingEffectivenessScore) / 5;
    let overallPerformanceGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (averageScore >= 90) overallPerformanceGrade = 'A';
    else if (averageScore >= 80) overallPerformanceGrade = 'B';
    else if (averageScore >= 70) overallPerformanceGrade = 'C';
    else if (averageScore >= 60) overallPerformanceGrade = 'D';

    // Generate trend data (simplified)
    const dailyTrend: { [key: string]: number } = {};
    const weeklyTrend: { [key: string]: number } = {};
    const monthlyTrend: { [key: string]: number } = {};

    // Mock trend data for demo
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyTrend[key] = Math.floor(averageScore + (Math.random() - 0.5) * 20);
    }

    return {
      activityScore,
      efficiencyScore,
      punctualityScore,
      geoComplianceScore,
      meetingEffectivenessScore,
      overallPerformanceGrade,
      trends: {
        daily: dailyTrend,
        weekly: weeklyTrend,
        monthly: monthlyTrend
      }
    };
  }

  // Export functions
  async exportToExcel(reportType: 'location' | 'branch' | 'meetings' | 'compliance' | 'performance' | 'all') {
    const workbook = XLSX.utils.book_new();
    
    try {
      if (reportType === 'location' || reportType === 'all') {
        const locationData = this.prepareLocationExportData();
        const locationSheet = XLSX.utils.json_to_sheet(locationData);
        XLSX.utils.book_append_sheet(workbook, locationSheet, 'Location Analytics');
      }

      if (reportType === 'branch' || reportType === 'all') {
        const branchData = this.prepareBranchExportData();
        const branchSheet = XLSX.utils.json_to_sheet(branchData);
        XLSX.utils.book_append_sheet(workbook, branchSheet, 'Branch Analytics');
      }

      if (reportType === 'meetings' || reportType === 'all') {
        const meetingData = this.prepareMeetingExportData();
        const meetingSheet = XLSX.utils.json_to_sheet(meetingData);
        XLSX.utils.book_append_sheet(workbook, meetingSheet, 'Meeting Analytics');
      }

      if (reportType === 'compliance' || reportType === 'all') {
        const complianceData = this.prepareComplianceExportData();
        const complianceSheet = XLSX.utils.json_to_sheet(complianceData);
        XLSX.utils.book_append_sheet(workbook, complianceSheet, 'Compliance Report');
      }

      if (reportType === 'performance' || reportType === 'all') {
        const performanceData = this.preparePerformanceExportData();
        const performanceSheet = XLSX.utils.json_to_sheet(performanceData);
        XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Performance KPIs');
      }

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `geo_tagging_analytics_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
    } catch (error) {
      console.error('Excel export failed:', error);
      throw error;
    }
  }

  async exportToCSV(reportType: 'location' | 'branch' | 'meetings' | 'compliance' | 'performance') {
    let data: any[] = [];
    let fileName = '';

    switch (reportType) {
      case 'location':
        data = this.prepareLocationExportData();
        fileName = 'location_analytics';
        break;
      case 'branch':
        data = this.prepareBranchExportData();
        fileName = 'branch_analytics';
        break;
      case 'meetings':
        data = this.prepareMeetingExportData();
        fileName = 'meeting_analytics';
        break;
      case 'compliance':
        data = this.prepareComplianceExportData();
        fileName = 'compliance_report';
        break;
      case 'performance':
        data = this.preparePerformanceExportData();
        fileName = 'performance_kpis';
        break;
    }

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  }

  async exportToPDF(elementId: string, reportName: string) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  private prepareLocationExportData() {
    const analytics = this.locationAnalytics();
    if (!analytics) return [];

    const locationHistory = this.locationService.getLocationHistory();
    return locationHistory.map(loc => ({
      'Employee ID': loc.empId,
      'Employee Name': loc.empName,
      'Date Time': new Date(loc.dateTime).toLocaleString(),
      'Latitude': loc.latitude,
      'Longitude': loc.longitude,
      'Location': loc.location,
      'Accuracy (m)': loc.accuracy,
      'User Initiated': loc.userInitiated ? 'Yes' : 'No',
      'Department': loc.department,
      'Channel': loc.channel
    }));
  }

  private prepareBranchExportData() {
    const analytics = this.branchAnalytics();
    if (!analytics) return [];

    return [{
      'Check-in Rate (%)': analytics.checkInRate.toFixed(2),
      'Huddle Completion Rate (%)': analytics.huddleCompletionRate.toFixed(2),
      'Closure Completion Rate (%)': analytics.closureCompletionRate.toFixed(2),
      'On-time Rate (%)': analytics.onTimeRate.toFixed(2),
      'Avg Huddle Duration (min)': analytics.avgHuddleDuration.toFixed(2),
      'Overall Compliance Score (%)': analytics.complianceScore.toFixed(2)
    }];
  }

  private prepareMeetingExportData() {
    const meetings = this.partnerService.meetings();
    return meetings.map(meeting => ({
      'Meeting ID': meeting.meetingId,
      'FLS Name': meeting.flsName,
      'Partner Name': meeting.partnerName,
      'Meeting Date': new Date(meeting.meetingDateTime).toLocaleString(),
      'Purpose': meeting.purpose,
      'Status': meeting.status,
      'Check-in Status': meeting.checkInStatus,
      'Duration (min)': meeting.duration || 'N/A',
      'Address': meeting.address,
      'Remark': meeting.remark || 'N/A'
    }));
  }

  private prepareComplianceExportData() {
    const compliance = this.complianceMetrics();
    if (!compliance) return [];

    return [{
      'Overall Score (%)': compliance.overallScore.toFixed(2),
      'Location Compliance (%)': compliance.locationCompliance.toFixed(2),
      'Branch Compliance (%)': compliance.branchCompliance.toFixed(2),
      'Meeting Compliance (%)': compliance.meetingCompliance.toFixed(2),
      'Policy Adherence (%)': compliance.policyAdherence.toFixed(2),
      'Risk Score': compliance.riskScore,
      'Violations': compliance.violations.join('; '),
      'Recommendations': compliance.recommendations.join('; ')
    }];
  }

  private preparePerformanceExportData() {
    const performance = this.performanceKPIs();
    if (!performance) return [];

    return [{
      'Activity Score (%)': performance.activityScore.toFixed(2),
      'Efficiency Score (%)': performance.efficiencyScore.toFixed(2),
      'Punctuality Score (%)': performance.punctualityScore.toFixed(2),
      'Geo-compliance Score (%)': performance.geoComplianceScore.toFixed(2),
      'Meeting Effectiveness Score (%)': performance.meetingEffectivenessScore.toFixed(2),
      'Overall Performance Grade': performance.overallPerformanceGrade
    }];
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    return csvContent;
  }
}
