import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  searchTerm = '';
  selectedRole = 'ALL';
  currentUserId: number | null = null;

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {
    // Récupérer l'ID de l'utilisateur connecté
    const currentUser = this.authService.currentUserValue;
    this.currentUserId = currentUser?.id || null;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('✅ Users loaded:', users);

        // ⚡ FILTRER L'ADMIN CONNECTÉ
        this.users = users.filter(user => user.id !== this.currentUserId);

        console.log(`✅ Filtered users (excluding current admin): ${this.users.length}`);

        this.filteredUsers = this.users;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole =
        this.selectedRole === 'ALL' ||
        user.role.toUpperCase() === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  deleteUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);

    if (!user) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.full_name} (${user.email}) ?`)) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          console.log('✅ User deleted successfully');
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('❌ Error deleting user:', error);
          alert('Erreur lors de la suppression de l\'utilisateur');
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.is_active ? 'désactiver' : 'activer';

    if (confirm(`Voulez-vous ${action} ${user.full_name} ?`)) {
      this.userService.toggleUserStatus(user.id).subscribe({
        next: (updatedUser) => {
          console.log('✅ User status toggled:', updatedUser);

          // Mettre à jour localement
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index].is_active = updatedUser.is_active;
          }

          // Re-filtrer
          this.filterUsers();
        },
        error: (error) => {
          console.error('❌ Error toggling user status:', error);
          alert('Erreur lors de la modification du statut');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const roleUpper = role.toUpperCase();
    const classes: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'AGRONOME': 'role-agronome',
      'ELEVEUR': 'role-eleveur'  // ✅ CORRIGÉ
    };
    return classes[roleUpper] || 'role-default';
  }

  getRoleIcon(role: string): string {
    const roleUpper = role.toUpperCase();
    const icons: { [key: string]: string } = {
      'ADMIN': '👨‍💼',
      'AGRONOME': '🔬',
      'ELEVEUR': '👨‍🌾'  // ✅ CORRIGÉ
    };
    return icons[roleUpper] || '👤';
  }

  getRoleLabel(role: string): string {
    const roleUpper = role.toUpperCase();
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'AGRONOME': 'Agronome',
      'ELEVEUR': 'Éleveur'  // ✅ CORRIGÉ
    };
    return labels[roleUpper] || role;
  }
}
