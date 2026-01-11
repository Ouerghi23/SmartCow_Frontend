import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CowService {
  private apiUrl = `${environment.apiUrl}/cows`;

  constructor(private http: HttpClient) {}

  getCows(page: number = 1, pageSize: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get(this.apiUrl, { params });
  }

  getCow(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCow(cowData: any): Observable<any> {
    return this.http.post(this.apiUrl, cowData);
  }

  updateCow(id: number, cowData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cowData);
  }

  deleteCow(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCowHealthHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/health-history`);
  }
}
