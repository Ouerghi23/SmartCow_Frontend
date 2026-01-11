import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
  private apiUrl = `${environment.apiUrl}/measures`;

  constructor(private http: HttpClient) {}

  getMeasures(cowId: number, page: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('cow_id', cowId.toString())
      .set('page', page.toString());

    return this.http.get(this.apiUrl, { params });
  }

  getLatestMeasure(cowId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${cowId}/latest`);
  }

  getStats(cowId: number, period: string = '24h'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/${cowId}/stats`, { params });
  }

  getGraphData(cowId: number, parameter: string, period: string = '24h'): Observable<any> {
    const params = new HttpParams()
      .set('parameter', parameter)
      .set('period', period);

    return this.http.get(`${this.apiUrl}/${cowId}/graph`, { params });
  }
}
