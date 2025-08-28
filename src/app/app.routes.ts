import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { LocationComponent } from './components/location.component';
import { PartnerMeetComponent } from './components/partner-meet.component';
import { ReportsComponent } from './components/reports.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'location', component: LocationComponent },
  { path: 'partner-meet', component: PartnerMeetComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' }
];
