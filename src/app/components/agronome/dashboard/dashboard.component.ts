import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CowService } from '../../../services/cow.service';
import { AlertService } from '../../../services/alert.service';
import { MeasureService } from '../../../services/measure.service';
import { AuthService } from '../../../services/auth.service';

interface AdvancedStats {
  totalCows: number;
  activeCows: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  totalAlerts: number; // ⚡ Ajouté
  avgTemperature: number;
  avgHeartRate: number;
  avgActivity: number;
  healthyPercentage: number;
  atRiskPercentage: number;
}

@Component({
  selector: 'app-agronome-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AgronomeDashboardComponent implements OnInit {
  stats: AdvancedStats = {
    totalCows: 0,
    activeCows: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
    infoAlerts: 0,
    totalAlerts: 0, // ⚡ Ajouté
    avgTemperature: 0,
    avgHeartRate: 0,
    avgActivity: 0,
    healthyPercentage: 0,
    atRiskPercentage: 0
  };

  cows: any[] = [];
  criticalCows: any[] = [];
  alerts: any[] = [];
  recentAlerts: any[] = []; // ⚡ Ajouté pour compatibilité template
  recentCows: any[] = []; // ⚡ Ajouté pour compatibilité template
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
        this.cows = response.cows;
        this.recentCows = response.cows.slice(0, 5); // ⚡ Pour template
        this.stats.totalCows = response.total;
        this.stats.activeCows = response.cows.filter((c: any) => c.is_active).length;

        const healthScores = response.cows.map((c: any) => c.health_score);
        this.stats.healthyPercentage = Math.round(
          (healthScores.filter((s: number) => s >= 80).length / healthScores.length) * 100
        );
        this.stats.atRiskPercentage = Math.round(
          (healthScores.filter((s: number) => s < 60).length / healthScores.length) * 100
        );

        this.criticalCows = response.cows
          .filter((c: any) => c.health_score < 60)
          .slice(0, 5);

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement vaches:', error);
        this.loading = false;
      }
    });

    this.alertService.getAlerts().subscribe({
      next: (response) => {
        this.alerts = response.alerts.slice(0, 8);
        this.recentAlerts = response.alerts.slice(0, 5); // ⚡ Pour template
        this.stats.totalAlerts = response.total; // ⚡ Ajouté
        this.stats.criticalAlerts = response.alerts.filter(
          (a: any) => a.severity === 'CRITICAL'
        ).length;
        this.stats.warningAlerts = response.alerts.filter(
          (a: any) => a.severity === 'WARNING'
        ).length;
        this.stats.infoAlerts = response.alerts.filter(
          (a: any) => a.severity === 'INFO'
        ).length;
      },
      error: (error) => {
        console.error('Erreur chargement alertes:', error);
      }
    });

    this.calculateAverageStats();
  }

  calculateAverageStats(): void {
    // TODO: Remplacer par vraie requête API
    this.stats.avgTemperature = 38.5;
    this.stats.avgHeartRate = 72;
    this.stats.avgActivity = 65;
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

  getHealthClass(score: number): string {
    if (score >= 80) return 'health-excellent';
    if (score >= 60) return 'health-good';
    return 'health-critical';
  }
}
