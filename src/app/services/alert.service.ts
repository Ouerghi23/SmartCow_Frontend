import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(filters?: any): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.severity) params = params.set('severity', filters.severity);
      if (filters.cow_id) params = params.set('cow_id', filters.cow_id);
    }

    return this.http.get(this.apiUrl, { params });
  }

  getAlert(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  acknowledgeAlert(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/acknowledge`, {});
  }

  resolveAlert(id: number, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/resolve`, {
      resolution_notes: notes
    });
  }
}
