import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService, Alert as AlertModel, AlertSeverity, AlertStatus, AlertType } from '../../../../services/alert.service';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.css']
})
export class AlertListComponent implements OnInit {
  alerts: AlertModel[] = [];
  filteredAlerts: AlertModel[] = [];
  loading = true;

  // Filters
  selectedSeverity: string = 'ALL';
  selectedStatus: string = 'ALL';
  selectedType: string = 'ALL';
  searchCowId: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 15;
  totalAlerts = 0;

  // Enums pour les templates
  AlertSeverity = AlertSeverity;
  AlertStatus = AlertStatus;
  AlertType = AlertType;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;

    const params: any = {
      page: this.currentPage,
      page_size: this.pageSize
    };

    if (this.selectedSeverity !== 'ALL') {
      params.severity = this.selectedSeverity.toLowerCase();
    }

    if (this.selectedStatus !== 'ALL') {
      params.status = this.selectedStatus.toLowerCase();
    }

    if (this.selectedType !== 'ALL') {
      params.type = this.selectedType.toLowerCase();
    }

    if (this.searchCowId) {
      params.cow_id = parseInt(this.searchCowId);
    }

    this.alertService.getAlerts(params).subscribe({
      next: (response) => {
        console.log('✅ Alerts loaded:', response);
        this.alerts = response.alerts;
        this.filteredAlerts = response.alerts;
        this.totalAlerts = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading alerts:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadAlerts();
  }

  acknowledgeAlert(alert: AlertModel): void {
    const notes = prompt('Notes d\'acquittement (optionnel):');

    this.alertService.acknowledgeAlert(alert.id, notes || undefined).subscribe({
      next: (updatedAlert) => {
        console.log('✅ Alert acknowledged:', updatedAlert);
        const index = this.alerts.findIndex(a => a.id === alert.id);
        if (index !== -1) {
          this.alerts[index] = updatedAlert;
          this.filteredAlerts = [...this.alerts];
        }
      },
      error: (error) => {
        console.error('❌ Error acknowledging alert:', error);
        window.alert('Erreur lors de l\'acquittement de l\'alerte');
      }
    });
  }

  resolveAlert(alert: AlertModel): void {
    const notes = prompt('Notes de résolution (requis):');

    if (!notes || notes.trim() === '') {
      window.alert('Les notes de résolution sont obligatoires');
      return;
    }

    this.alertService.resolveAlert(alert.id, notes).subscribe({
      next: (updatedAlert) => {
        console.log('✅ Alert resolved:', updatedAlert);
        const index = this.alerts.findIndex(a => a.id === alert.id);
        if (index !== -1) {
          this.alerts[index] = updatedAlert;
          this.filteredAlerts = [...this.alerts];
        }
      },
      error: (error) => {
        console.error('❌ Error resolving alert:', error);
        window.alert('Erreur lors de la résolution de l\'alerte');
      }
    });
  }

  deleteAlert(alert: AlertModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette alerte #${alert.id} ?`)) {
      this.alertService.deleteAlert(alert.id).subscribe({
        next: () => {
          console.log('✅ Alert deleted');
          this.loadAlerts();
        },
        error: (error) => {
          console.error('❌ Error deleting alert:', error);
          window.alert('Erreur lors de la suppression');
        }
      });
    }
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

  getStatusClass(status: AlertStatus): string {
    const classes: { [key: string]: string } = {
      'new': 'status-new',
      'acknowledged': 'status-acknowledged',
      'in_progress': 'status-progress',
      'resolved': 'status-resolved',
      'escalated': 'status-escalated'
    };
    return classes[status] || 'status-new';
  }

  getStatusLabel(status: AlertStatus): string {
    const labels: { [key: string]: string } = {
      'new': '🆕 Nouvelle',
      'acknowledged': '👁️ Acquittée',
      'in_progress': '⏳ En cours',
      'resolved': '✅ Résolue',
      'escalated': '🚨 Escaladée'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: AlertType): string {
    const labels: { [key: string]: string } = {
      'temperature': '🌡️ Température',
      'heart_rate': '💓 Rythme cardiaque',
      'inactivity': '😴 Inactivité',
      'battery': '🔋 Batterie',
      'prediction': '🤖 Prédiction IA'
    };
    return labels[type] || type;
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalAlerts) {
      this.currentPage++;
      this.loadAlerts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAlerts();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalAlerts / this.pageSize);
  }

  canAcknowledge(alert: AlertModel): boolean {
    return alert.status === AlertStatus.NEW;
  }

  canResolve(alert: AlertModel): boolean {
    return alert.status === AlertStatus.ACKNOWLEDGED || alert.status === AlertStatus.IN_PROGRESS;
  }
}
