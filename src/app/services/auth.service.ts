import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const formData = new URLSearchParams();
    formData.set('username', email);
    formData.set('password', password);

    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      formData.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).pipe(
      tap(response => {
        console.log('✅ Login response:', response);

        // Sauvegarder les tokens
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        // Décoder le token pour obtenir le rôle
        const payload = this.decodeToken(response.access_token);
        console.log('✅ Token payload:', payload);

        if (payload && payload.role) {
          // Créer un objet user
          const user: User = {
            id: payload.sub || payload.user_id,
            email: payload.email || email,
            full_name: payload.full_name || 'User',
            role: payload.role.toUpperCase() // Convertir en majuscules
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);

          console.log('✅ User stored:', user);

          // Charger le profil complet
          this.getProfile().subscribe();

          this.redirectByRole(user.role);
        }
      })
    );
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }

  private redirectByRole(role: string): void {
    console.log('🔀 Redirecting based on role:', role);

    const roleUpper = role.toUpperCase();

    switch (roleUpper) {
      case 'ADMIN':
        console.log('✅ Redirecting to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'AGRONOME':
        console.log('✅ Redirecting to agronome dashboard');
        this.router.navigate(['/agronome/dashboard']);
        break;
      case 'ELEVEUR':  // ✅ CORRIGÉ
        console.log('⚠️ Éleveur role - mobile app required');
        alert('L\'espace éleveur est accessible uniquement via l\'application mobile.');
        this.logout();
        break;
      default:
        console.error('❌ Unknown role:', role);
        this.router.navigate(['/login']);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        // Mettre à jour le user dans localStorage
        const currentUser = this.currentUserValue;
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser as User);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
