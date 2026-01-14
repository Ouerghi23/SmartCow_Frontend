import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  badgeClass?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  currentUser: any;
  sidebarCollapsed = false;
  currentRoute = '';

  menuItems: MenuItem[] = [
    {
      icon: '🏠',
      label: 'Dashboard',
      route: '/admin/dashboard'
    },
    {
      icon: '👥',
      label: 'Utilisateurs',
      route: '/admin/users'
    },
    {
      icon: '🐄',
      label: 'Troupeau',
      route: '/admin/cows'
    },
    {
      icon: '🚨',
      label: 'Alertes',
      route: '/admin/alerts',
      badge: 0,
      badgeClass: 'badge-danger'
    },
    {
      icon: '📊',
      label: 'Rapports',
      route: '/admin/reports'
    },
    {
      icon: '⚙️',
      label: 'Paramètres',
      route: '/admin/settings'
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;

    // Tracker la route active
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}
