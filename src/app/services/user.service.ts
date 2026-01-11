import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: {
    admin: number;
    agronome: number;
    eleveur: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les utilisateurs
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats/overview`);
  }
}
