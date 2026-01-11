import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CowService } from '../../../services/cow.service';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class FarmerDashboardComponent implements OnInit {
  stats = {
    totalCows: 0,
    activeCows: 0,
    activeAlerts: 0
  };

  cows: any[] = [];
  alerts: any[] = [];
  loading = true;

  constructor(
    private cowService: CowService,
    private alertService: AlertService,
    public authService: AuthService  // ⚡ Changez 'private' en 'public'
  ) {}

  ngOnInit(): void {
    this.loadData();
    setInterval(() => this.loadData(), 30000);
  }

  loadData(): void {
    this.cowService.getCows().subscribe({
      next: (response) => {
        this.cows = response.cows;
        this.stats.totalCows = response.total;
        this.stats.activeCows = response.cows.filter((c: any) => c.is_active).length;
        this.loading = false;
      }
    });

    this.alertService.getAlerts({ status: 'NEW' }).subscribe({
      next: (response) => {
        this.alerts = response.alerts.slice(0, 5);
        this.stats.activeAlerts = response.total;
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
}
