import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

// Utiliser l'interface User du service
type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  errorMessage = '';
  userId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  loadUser(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        console.log('✅ User loaded:', user);
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading user:', error);
        this.errorMessage = 'Impossible de charger les détails de l\'utilisateur';
        this.loading = false;

        if (error.status === 404) {
          this.errorMessage = 'Utilisateur introuvable';
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 2000);
        }
      }
    });
  }

  deleteUser(): void {
    if (!this.user) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${this.user.full_name} (${this.user.email}) ?\n\nCette action est irréversible !`;

    if (confirm(confirmMessage)) {
      this.userService.deleteUser(this.userId).subscribe({
        next: () => {
          console.log('✅ User deleted');
          alert('Utilisateur supprimé avec succès');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('❌ Error deleting user:', error);
          alert('Erreur lors de la suppression de l\'utilisateur');
        }
      });
    }
  }

  toggleUserStatus(): void {
    if (!this.user) return;

    const action = this.user.is_active ? 'désactiver' : 'activer';

    if (confirm(`Voulez-vous ${action} cet utilisateur ?`)) {
      this.userService.toggleUserStatus(this.userId).subscribe({
        next: (updatedUser) => {
          console.log('✅ User status toggled');
          this.user = updatedUser;
        },
        error: (error) => {
          console.error('❌ Error toggling status:', error);
          alert('Erreur lors du changement de statut');
        }
      });
    }
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'ADMIN': '👨‍💼',
      'AGRONOME': '🔬',
      'ELEVEUR': '👨‍🌾'
    };
    return icons[role] || '👤';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'AGRONOME': 'Agronome',
      'ELEVEUR': 'Éleveur'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'ADMIN': 'badge-admin',
      'AGRONOME': 'badge-agronome',
      'ELEVEUR': 'badge-eleveur'
    };
    return classes[role] || 'badge-default';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAccountAge(): string {
    if (!this.user?.created_at) return 'N/A';

    const created = new Date(this.user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  }
}
