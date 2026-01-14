import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService, UserStats } from '../../../services/user.service';
import { CowService, CowStats } from '../../../services/cow.service';
import { AlertService, AlertStats, Alert, AlertSeverity } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';

interface DashboardStats {
  users: UserStats | null;
  cows: CowStats | null;
  alerts: AlertStats | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    users: null,
    cows: null,
    alerts: null
  };

  recentAlerts: Alert[] = [];
  loading = true;
  currentUser: any;
  error = '';

  constructor(
    private userService: UserService,
    private cowService: CowService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDashboardData();

    // 🔄 Rafraîchir les données quand on navigue vers le dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url.includes('/admin/dashboard') || this.router.url === '/admin') {
        console.log('🔄 Dashboard visible - Rafraîchissement des données...');
        this.refreshData();
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    let loadedCount = 0;
    const totalLoads = 4;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalLoads) {
        this.loading = false;
        console.log('✅ Toutes les données chargées:', this.stats);
      }
    };

    // Charger les stats utilisateurs
    this.userService.getUserStats().subscribe({
      next: (data) => {
        this.stats.users = data;
        console.log('✅ User stats loaded:', data);
        checkAllLoaded();
      },
      error: (err) => {
        console.error('❌ Error loading user stats:', err);
        checkAllLoaded();
      }
    });

    // Charger les stats vaches
    this.cowService.getCowStats().subscribe({
      next: (data) => {
        this.stats.cows = data;
        console.log('✅ Cow stats loaded:', data);
        console.log('📊 Total cows:', data?.total_cows);
        checkAllLoaded();
      },
      error: (err) => {
        console.error('❌ Error loading cow stats:', err);
        this.error = 'Erreur lors du chargement des statistiques des vaches';
        checkAllLoaded();
      }
    });

    // Charger les stats alertes
    this.alertService.getAlertStats({ days: 7 }).subscribe({
      next: (data) => {
        this.stats.alerts = data;
        console.log('✅ Alert stats loaded:', data);
        checkAllLoaded();
      },
      error: (err) => {
        console.error('❌ Error loading alert stats:', err);
        checkAllLoaded();
      }
    });

    // Charger les alertes récentes
    this.alertService.getAlerts({
      page: 1,
      page_size: 5,
      status: undefined
    }).subscribe({
      next: (response) => {
        this.recentAlerts = response.alerts;
        console.log('✅ Recent alerts loaded:', response.alerts);
        checkAllLoaded();
      },
      error: (err) => {
        console.error('❌ Error loading recent alerts:', err);
        checkAllLoaded();
      }
    });
  }

  getSeverityClass(severity: AlertSeverity): string {
    const classes: { [key: string]: string } = {
      'critical': 'severity-critical',
      'warning': 'severity-warning',
      'info': 'severity-info'
    };
    return classes[severity] || 'severity-info';
  }

  getSeverityIcon(severity: AlertSeverity): string {
    const icons: { [key: string]: string } = {
      'critical': '🔴',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    return icons[severity] || 'ℹ️';
  }

  getAlertTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'temperature': 'Température',
      'heart_rate': 'Rythme cardiaque',
      'inactivity': 'Inactivité',
      'battery': 'Batterie',
      'prediction': 'Prédiction IA'
    };
    return labels[type] || type;
  }

  refreshData(): void {
    console.log('🔄 Rafraîchissement manuel des données...');
    this.loadDashboardData();
  }
}
