import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Auth Components
import { LoginComponent } from './components/login/login.component';

// Admin Components

// User Management Components
import { UserListComponent } from './components/admin/users/user-list/user-list.component';
import { UserCreateComponent } from './components/admin/users/user-create/user-create.component';
import { UserDetailComponent } from './components/admin/users/user-detail/user-detail.component';
import { UserEditComponent } from './components/admin/users/user-edit/user-edit.component';

// Cow Management Components

// Alert Management Components
import { AlertListComponent } from './components/admin/alerts/alert-list/alert-list.component';

// Agronome Components
import { AgronomeDashboardComponent } from './components/agronome/dashboard/dashboard.component';
import { CowListComponent } from './components/admin/cows/cow-list/cow-list.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Login
  {
    path: 'login',
    component: LoginComponent
  },

  // ==========================================
  // ADMIN ROUTES (avec Layout)
  // ==========================================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ========== DASHBOARD ==========
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: { title: 'Dashboard' }
      },

      // ========== USERS (COMPLET) ==========
      {
        path: 'users',
        component: UserListComponent,
        data: { title: 'Gestion des utilisateurs' }
      },
      {
        path: 'users/new',
        component: UserCreateComponent,
        data: { title: 'Nouvel utilisateur' }
      },
      {
        path: 'users/:id',
        component: UserDetailComponent,
        data: { title: 'Détails utilisateur' }
      },
      {
        path: 'users/:id/edit',
        component: UserEditComponent,
        data: { title: 'Modifier utilisateur' }
      },

      // ========== COWS ==========
      {
        path: 'cows',
        component: CowListComponent,
        data: { title: 'Gestion du troupeau' }
      },
      {
        path: 'cows/new',
        component: CowListComponent, // TODO: Créer CowCreateComponent
        data: { title: 'Nouvelle vache' }
      },
      {
        path: 'cows/:id',
        component: CowListComponent, // TODO: Créer CowDetailComponent
        data: { title: 'Fiche vache' }
      },
      {
        path: 'cows/:id/edit',
        component: CowListComponent, // TODO: Créer CowEditComponent
        data: { title: 'Modifier vache' }
      },

      // ========== ALERTS ==========
      {
        path: 'alerts',
        component: AlertListComponent,
        data: { title: 'Gestion des alertes' }
      },
      {
        path: 'alerts/:id',
        component: AlertListComponent, // TODO: Créer AlertDetailComponent
        data: { title: 'Détails alerte' }
      },

      // ========== REPORTS ==========
      {
        path: 'reports',
        component: AdminDashboardComponent, // TODO: Créer ReportsComponent
        data: { title: 'Rapports' }
      },

      // ========== SETTINGS ==========
      {
        path: 'settings',
        component: AdminDashboardComponent, // TODO: Créer SettingsComponent
        data: { title: 'Paramètres' }
      }
    ]
  },

  // ==========================================
  // AGRONOME ROUTES
  // ==========================================
  {
    path: 'agronome',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'AGRONOME' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AgronomeDashboardComponent
      }
    ]
  },

  // ==========================================
  // WILDCARD (404)
  // ==========================================
  {
    path: '**',
    redirectTo: '/login'
  }
];
