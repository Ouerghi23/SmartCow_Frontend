import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CowService } from '../../../services/cow.service';
import { AlertService } from '../../../services/alert.service';
import { MeasureService } from '../../../services/measure.service';
import { AuthService } from '../../../services/auth.service';

interface Stats {
  totalCows: number;
  activeCows: number;
  criticalAlerts: number;
  totalAlerts: number;
  avgTemperature: number;
  avgHeartRate: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: Stats = {
    totalCows: 0,
    activeCows: 0,
    criticalAlerts: 0,
    totalAlerts: 0,
    avgTemperature: 0,
    avgHeartRate: 0
  };

  recentAlerts: any[] = [];
  recentCows: any[] = [];
  loading = true;

  constructor(
    private cowService: CowService,
    private alertService: AlertService,
    private measureService: MeasureService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    setInterval(() => this.loadDashboardData(), 30000);
  }

  loadDashboardData(): void {
    this.cowService.getCows(1, 100).subscribe({
      next: (response) => {
        this.stats.totalCows = response.total;
        this.stats.activeCows = response.cows.filter((c: any) => c.is_active).length;
        this.recentCows = response.cows.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des vaches:', error);
        this.loading = false;
      }
    });

    this.alertService.getAlerts().subscribe({
      next: (response) => {
        this.stats.totalAlerts = response.total;
        this.stats.criticalAlerts = response.alerts.filter(
          (a: any) => a.severity === 'CRITICAL'
        ).length;
        this.recentAlerts = response.alerts.slice(0, 5);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getSeverityClass(severity: string): string {
    const classes: any = {
      'CRITICAL': 'severity-critical',
      'WARNING': 'severity-warning',
      'INFO': 'severity-info'
    };
    return classes[severity] || 'severity-info';
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'NEW': 'status-new',
      'ACKNOWLEDGED': 'status-acknowledged',
      'RESOLVED': 'status-resolved'
    };
    return classes[status] || 'status-new';
  }
}
