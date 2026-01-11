import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    const requiredRole = route.data['role'];

    console.log('🔒 RoleGuard checking:', {
      currentUser: currentUser?.role,
      requiredRole
    });

    if (!currentUser) {
      console.log('❌ No user, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // Comparaison en majuscules
    if (currentUser.role.toUpperCase() === requiredRole.toUpperCase()) {
      console.log('✅ Role authorized');
      return true;
    }

    // Rôle non autorisé, rediriger vers dashboard approprié
    console.log('❌ Role not authorized, redirecting...');

    switch (currentUser.role.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'AGRONOME':
        this.router.navigate(['/agronome/dashboard']);
        break;
      case 'ELEVEUR':  // ✅ CORRIGÉ
        this.router.navigate(['/login']);
        break;
      default:
        this.router.navigate(['/login']);
    }

    return false;
  }
}
