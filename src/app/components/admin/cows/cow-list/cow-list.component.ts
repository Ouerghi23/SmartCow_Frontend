import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CowService, Cow } from '../../../../services/cow.service';

@Component({
  selector: 'app-cow-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cow-list.component.html',
  styleUrls: ['./cow-list.component.css']
})
export class CowListComponent implements OnInit {
  cows: Cow[] = [];
  filteredCows: Cow[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = 'ALL';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalCows = 0;

  constructor(private cowService: CowService) {}

  ngOnInit(): void {
    this.loadCows();
  }

  loadCows(): void {
    this.loading = true;

    const params: any = {
      page: this.currentPage,
      page_size: this.pageSize
    };

    if (this.selectedStatus !== 'ALL') {
      params.is_active = this.selectedStatus === 'ACTIVE';
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.cowService.getCows(params).subscribe({
      next: (response) => {
        console.log('✅ Cows loaded:', response);
        this.cows = response.cows;
        this.filteredCows = response.cows;
        this.totalCows = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cows:', error);
        this.loading = false;
      }
    });
  }

  filterCows(): void {
    this.currentPage = 1; // Reset to first page
    this.loadCows();
  }

  deleteCow(cow: Cow): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${cow.name} (${cow.tag_id}) ?`)) {
      this.cowService.deleteCow(cow.id).subscribe({
        next: () => {
          console.log('✅ Cow deleted successfully');
          this.loadCows();
        },
        error: (error) => {
          console.error('❌ Error deleting cow:', error);
          alert('Erreur lors de la suppression de la vache');
        }
      });
    }
  }

  getHealthScoreClass(score: number): string {
    if (score >= 80) return 'health-good';
    if (score >= 60) return 'health-warning';
    return 'health-critical';
  }

  getHealthScoreIcon(score: number): string {
    if (score >= 80) return '💚';
    if (score >= 60) return '⚠️';
    return '🔴';
  }

  getAgeDisplay(ageYears: number | undefined): string {
    if (!ageYears) return 'N/A';
    const years = Math.floor(ageYears);
    const months = Math.floor((ageYears - years) * 12);

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ''}`;
    }
    return `${months} mois`;
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCows) {
      this.currentPage++;
      this.loadCows();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCows();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCows / this.pageSize);
  }
}
