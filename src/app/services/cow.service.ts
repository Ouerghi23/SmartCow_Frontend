import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cow {
  id: number;
  name: string;
  tag_id: string;
  breed: string;
  birth_date: string;
  weight: number;
  photo_url?: string;
  notes?: string;
  health_score: number;
  is_active: boolean;
  age_years?: number;
  created_at: string;
  updated_at?: string;
}

export interface CowListResponse {
  total: number;
  page: number;
  page_size: number;
  cows: Cow[];
}

export interface CowStats {
  total_cows: number;
  active_cows: number;
  inactive_cows: number;
  average_health_score: number;
  cows_with_alerts: number;
}

@Injectable({
  providedIn: 'root'
})
export class CowService {
  private apiUrl = `${environment.apiUrl}/cows`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les vaches avec pagination et filtres
   */
  getCows(params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
    search?: string;
  }): Observable<CowListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
      if (params.is_active !== undefined) httpParams = httpParams.set('is_active', params.is_active ? '1' : '0');
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<CowListResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Récupérer une vache par ID
   */
  getCow(id: number): Observable<Cow> {
    return this.http.get<Cow>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle vache
   */
  createCow(cowData: Partial<Cow>): Observable<Cow> {
    return this.http.post<Cow>(this.apiUrl, cowData);
  }

  /**
   * Mettre à jour une vache
   */
  updateCow(id: number, cowData: Partial<Cow>): Observable<Cow> {
    return this.http.put<Cow>(`${this.apiUrl}/${id}`, cowData);
  }

  /**
   * Supprimer une vache
   */
  deleteCow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer le score de santé d'une vache
   */
  getHealthScore(id: number): Observable<{
    cow_id: number;
    health_score: number;
    status: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${id}/health-score`);
  }

  /**
   * Récupérer les statistiques des vaches
   */
  getCowStats(): Observable<CowStats> {
    return this.http.get<CowStats>(`${this.apiUrl}/stats/overview`);
  }
}
