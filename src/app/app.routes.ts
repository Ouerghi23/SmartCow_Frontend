import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AgronomeDashboardComponent } from './components/agronome/dashboard/dashboard.component';
import { UserListComponent } from './components/admin/users/user-list/user-list.component'; // ⚡ Ajouté

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UserListComponent } // ⚡ Maintenant ça marche
    ]
  },

  // Agronome Routes
  {
    path: 'agronome',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'AGRONOME' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AgronomeDashboardComponent }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
