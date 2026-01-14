import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum AlertType {
  TEMPERATURE = 'temperature',
  HEART_RATE = 'heart_rate',
  INACTIVITY = 'inactivity',
  BATTERY = 'battery',
  PREDICTION = 'prediction'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

export interface Alert {
  id: number;
  cow_id: number;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  measured_value?: number;
  threshold_value?: number;
  message: string;
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AlertWithCow extends Alert {
  cow_name: string;
  cow_tag_id: string;
}

export interface AlertListResponse {
  total: number;
  page: number;
  page_size: number;
  alerts: Alert[];
}

export interface AlertStats {
  total_alerts: number;
  new_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  info_alerts: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les alertes avec filtres
   */
  getAlerts(params?: {
    page?: number;
    page_size?: number;
    cow_id?: number;
    type?: AlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    start_date?: string;
    end_date?: string;
  }): Observable<AlertListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
      if (params.cow_id) httpParams = httpParams.set('cow_id', params.cow_id.toString());
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.severity) httpParams = httpParams.set('severity', params.severity);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.start_date) httpParams = httpParams.set('start_date', params.start_date);
      if (params.end_date) httpParams = httpParams.set('end_date', params.end_date);
    }

    return this.http.get<AlertListResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Récupérer une alerte par ID
   */
  getAlert(id: number): Observable<AlertWithCow> {
    return this.http.get<AlertWithCow>(`${this.apiUrl}/${id}`);
  }

  /**
   * Acquitter une alerte
   */
  acknowledgeAlert(id: number, notes?: string): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${id}/acknowledge`, { notes });
  }

  /**
   * Résoudre une alerte
   */
  resolveAlert(id: number, resolution_notes: string): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${id}/resolve`, { resolution_notes });
  }

  /**
   * Supprimer une alerte (Admin only)
   */
  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques des alertes
   */
  getAlertStats(params?: {
    cow_id?: number;
    days?: number;
  }): Observable<AlertStats> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.cow_id) httpParams = httpParams.set('cow_id', params.cow_id.toString());
      if (params.days) httpParams = httpParams.set('days', params.days.toString());
    }

    return this.http.get<AlertStats>(`${this.apiUrl}/stats`, { params: httpParams });
  }
}
