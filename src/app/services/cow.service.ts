import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {
    console.log('🐄 CowService initialized with API URL:', this.apiUrl);
  }

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

    console.log('🔎 Fetching cows with params:', params);

    return this.http.get<CowListResponse>(this.apiUrl, { params: httpParams }).pipe(
      tap(response => console.log('✅ Cows fetched:', response)),
      catchError(error => {
        console.error('❌ Error fetching cows:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer une vache par ID
   */
  getCow(id: number): Observable<Cow> {
    console.log('🔎 Fetching cow with ID:', id);

    return this.http.get<Cow>(`${this.apiUrl}/${id}`).pipe(
      tap(cow => console.log('✅ Cow fetched:', cow)),
      catchError(error => {
        console.error('❌ Error fetching cow:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Créer une nouvelle vache
   */
  createCow(cowData: Partial<Cow>): Observable<Cow> {
    console.log('➕ Creating cow:', cowData);

    return this.http.post<Cow>(this.apiUrl, cowData).pipe(
      tap(cow => {
        console.log('✅ Cow created:', cow);
        // Notification de succès
        console.log('🔄 Cow created - stats should be refreshed');
      }),
      catchError(error => {
        console.error('❌ Error creating cow:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour une vache
   */
  updateCow(id: number, cowData: Partial<Cow>): Observable<Cow> {
    console.log('📝 Updating cow:', id, cowData);

    return this.http.put<Cow>(`${this.apiUrl}/${id}`, cowData).pipe(
      tap(cow => console.log('✅ Cow updated:', cow)),
      catchError(error => {
        console.error('❌ Error updating cow:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer une vache
   */
  deleteCow(id: number): Observable<void> {
    console.log('🗑️ Deleting cow:', id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('✅ Cow deleted')),
      catchError(error => {
        console.error('❌ Error deleting cow:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer le score de santé d'une vache
   */
  getHealthScore(id: number): Observable<{
    cow_id: number;
    health_score: number;
    status: string;
  }> {
    console.log('🏥 Fetching health score for cow:', id);

    return this.http.get<any>(`${this.apiUrl}/${id}/health-score`).pipe(
      tap(score => console.log('✅ Health score fetched:', score)),
      catchError(error => {
        console.error('❌ Error fetching health score:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les statistiques des vaches
   *
   * ⚠️ IMPORTANT: Vérifiez que l'endpoint backend correspond !
   * Options possibles :
   * - /api/cows/stats (Django standard)
   * - /api/cows/stats/overview
   *
   * Testez dans votre navigateur ou avec curl :
   * curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/cows/stats
   */
  getCowStats(): Observable<CowStats> {
    // 🔧 CORRECTION : Essayez d'abord sans /overview
    const endpoint = `${this.apiUrl}/stats`;
 
    console.log('📊 Fetching cow stats from:', endpoint);

    return this.http.get<CowStats>(endpoint).pipe(
      tap(stats => {
        console.log('✅ Cow stats fetched:', stats);
        console.log('📊 Total cows:', stats.total_cows);
        console.log('📊 Active cows:', stats.active_cows);
      }),
      catchError(error => {
        console.error('❌ Error fetching cow stats:', error);
        console.error('❌ Endpoint tried:', endpoint);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });

        // Si l'endpoint ne fonctionne pas, essayer avec /overview
        if (error.status === 404) {
          console.log('🔄 Trying alternative endpoint: /stats/overview');
          return this.http.get<CowStats>(`${this.apiUrl}/stats/overview`).pipe(
            tap(stats => console.log('✅ Cow stats fetched (alternative):', stats)),
            catchError(altError => {
              console.error('❌ Alternative endpoint also failed:', altError);
              return throwError(() => altError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * 🆕 Méthode pour forcer le rechargement du cache (si nécessaire)
   */
  clearCache(): void {
    console.log('🧹 Clearing cow service cache');
    // Implémentez ici si vous avez un cache
  }
}
