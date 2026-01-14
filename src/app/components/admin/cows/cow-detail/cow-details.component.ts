import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CowService, Cow } from '../../../../services/cow.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-cow-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cow-details.component.html',
  styleUrls: ['./cow-details.component.css']
})
export class CowDetailComponent implements OnInit {
  cow: Cow | null = null;
  loading = true;
  errorMessage = '';
  cowId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cowService: CowService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cowId = +params['id'];
      this.loadCow();
    });
  }

  loadCow(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cowService.getCow(this.cowId).subscribe({
      next: (cow) => {
        console.log('✅ Cow loaded:', cow);
        this.cow = cow;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cow:', error);
        this.errorMessage = 'Impossible de charger les détails de la vache';
        this.loading = false;

        if (error.status === 404) {
          this.errorMessage = 'Vache introuvable';
          setTimeout(() => {
            this.router.navigate(['/admin/cows']);
          }, 2000);
        }
      }
    });
  }

  deleteCow(): void {
    if (!this.cow) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${this.cow.name} (${this.cow.tag_id}) ?\n\nCette action est irréversible !`;

    if (confirm(confirmMessage)) {
      this.cowService.deleteCow(this.cowId).subscribe({
        next: () => {
          console.log('✅ Cow deleted');
          alert('Vache supprimée avec succès');
          this.router.navigate(['/admin/cows']);
        },
        error: (error) => {
          console.error('❌ Error deleting cow:', error);
          alert('Erreur lors de la suppression de la vache');
        }
      });
    }
  }

  toggleCowStatus(): void {
    if (!this.cow) return;

    const action = this.cow.is_active ? 'désactiver' : 'activer';

    if (confirm(`Voulez-vous ${action} cette vache ?`)) {
      const updatedData = { is_active: !this.cow.is_active };

      this.cowService.updateCow(this.cowId, updatedData).subscribe({
        next: (updatedCow) => {
          console.log('✅ Cow status toggled');
          this.cow = updatedCow;
        },
        error: (error) => {
          console.error('❌ Error toggling status:', error);
          alert('Erreur lors du changement de statut');
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
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

  getAge(): string {
    if (!this.cow?.birth_date) return 'N/A';

    const birth = new Date(this.cow.birth_date);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const ageInYears = (ageInDays / 365.25).toFixed(1);

    if (ageInDays < 30) {
      return `${ageInDays} jours`;
    } else if (ageInDays < 365) {
      return `${Math.floor(ageInDays / 30)} mois`;
    }
    return `${ageInYears} ans`;
  }

  getHealthScoreClass(): string {
    if (!this.cow) return 'health-unknown';
    if (this.cow.health_score >= 80) return 'health-good';
    if (this.cow.health_score >= 60) return 'health-warning';
    return 'health-critical';
  }

  getHealthScoreLabel(): string {
    if (!this.cow) return 'Inconnu';
    if (this.cow.health_score >= 80) return 'Excellente santé';
    if (this.cow.health_score >= 60) return 'Santé correcte';
    return 'Santé critique';
  }

  getHealthScoreIcon(): string {
    if (!this.cow) return '❓';
    if (this.cow.health_score >= 80) return '✅';
    if (this.cow.health_score >= 60) return '⚠️';
    return '🔴';
  }

  getStatusClass(): string {
    return this.cow?.is_active ? 'active' : 'inactive';
  }

  getStatusLabel(): string {
    return this.cow?.is_active ? '✅ Active' : '❌ Inactive';
  }

  getStatusIcon(): string {
    return this.cow?.is_active ? '🟢' : '🔴';
  }

  getCowInitials(): string {
    if (!this.cow?.name) return '🐄';
    return this.cow.name.charAt(0).toUpperCase();
  }

  hasPhoto(): boolean {
    return !!(this.cow?.photo_url && this.cow.photo_url.trim() !== '');
  }

  exportToPDF(): void {
    if (!this.cow) return;

    const doc = new jsPDF();

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Couleurs
    const primaryColor: [number, number, number] = [139, 69, 19]; // Marron
    const textColor: [number, number, number] = [44, 62, 80]; // Texte foncé
    const lightBg: [number, number, number] = [245, 241, 232]; // Beige clair

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('🐄 FICHE VACHE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('SmartCow - Gestion du troupeau', pageWidth / 2, 30, { align: 'center' });

    yPos = 50;

    // ===== NOM & TAG ID =====
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(this.cow.name, margin, yPos);

    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Tag ID: ${this.cow.tag_id}`, margin, yPos);

    yPos += 15;

    // ===== SECTION: IDENTIFICATION =====
    this.addSectionTitle(doc, '🐄 IDENTIFICATION', margin, yPos, pageWidth);
    yPos += 10;

    const identificationData = [
      { label: 'Nom', value: this.cow.name },
      { label: 'Numéro de boucle (Tag ID)', value: this.cow.tag_id },
      { label: 'Race', value: this.cow.breed || 'Non spécifiée' },
      { label: 'ID Système', value: `#${this.cow.id}` }
    ];

    yPos = this.addDataSection(doc, identificationData, margin, yPos, pageWidth);
    yPos += 10;

    // ===== SECTION: CARACTÉRISTIQUES =====
    this.addSectionTitle(doc, '📏 CARACTÉRISTIQUES', margin, yPos, pageWidth);
    yPos += 10;

    const caracteristiquesData = [
      { label: 'Date de naissance', value: this.formatDate(this.cow.birth_date) },
      { label: 'Âge', value: this.getAge() },
      { label: 'Poids', value: this.cow.weight ? `${this.cow.weight} kg` : 'Non renseigné' },
      { label: 'Statut', value: this.cow.is_active ? '✅ Active' : '❌ Inactive' }
    ];

    yPos = this.addDataSection(doc, caracteristiquesData, margin, yPos, pageWidth);
    yPos += 10;

    // ===== SECTION: ÉTAT DE SANTÉ =====
    this.addSectionTitle(doc, '🏥 ÉTAT DE SANTÉ', margin, yPos, pageWidth);
    yPos += 10;

    // Health Score avec barre
    doc.setFillColor(...lightBg);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Score de santé:', margin + 5, yPos + 8);

    doc.setFontSize(16);
    const healthColor = this.getHealthScorePDFColor(this.cow.health_score);
    doc.setTextColor(...healthColor);
    doc.text(`${this.cow.health_score}/100`, margin + 5, yPos + 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(this.getHealthScoreLabel(), margin + 40, yPos + 18);

    // Barre de progression
    const barWidth = pageWidth - 2 * margin - 10;
    const barHeight = 8;
    const barX = margin + 5;
    const barY = yPos + 20;

    // Background barre
    doc.setFillColor(220, 220, 220);
    doc.rect(barX, barY, barWidth, barHeight, 'F');

    // Progress barre
    doc.setFillColor(...healthColor);
    doc.rect(barX, barY, (barWidth * this.cow.health_score) / 100, barHeight, 'F');

    yPos += 35;

    // ===== SECTION: HISTORIQUE =====
    this.addSectionTitle(doc, '📅 HISTORIQUE', margin, yPos, pageWidth);
    yPos += 10;

    const historiqueData = [
      { label: 'Ajoutée le', value: this.formatDateTime(this.cow.created_at) },
      { label: 'Dernière modification', value: this.cow.updated_at ? this.formatDateTime(this.cow.updated_at) : 'N/A' }
    ];

    yPos = this.addDataSection(doc, historiqueData, margin, yPos, pageWidth);
    yPos += 10;

    // ===== SECTION: NOTES =====
    if (this.cow.notes) {
      // Vérifier si on a assez d'espace, sinon nouvelle page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      this.addSectionTitle(doc, '📝 NOTES ET OBSERVATIONS', margin, yPos, pageWidth);
      yPos += 10;

      doc.setFillColor(...lightBg);
      const notesHeight = Math.min(40, (this.cow.notes.length / 100) * 5 + 15);
      doc.rect(margin, yPos, pageWidth - 2 * margin, notesHeight, 'F');

      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const splitNotes = doc.splitTextToSize(this.cow.notes, pageWidth - 2 * margin - 10);
      doc.text(splitNotes, margin + 5, yPos + 8);

      yPos += notesHeight + 10;
    }

    // ===== FOOTER =====
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    const now = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Document généré le ${now}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // ===== SAUVEGARDE =====
    const filename = `Fiche_${this.cow.name.replace(/\s+/g, '_')}_${this.cow.tag_id}.pdf`;
    doc.save(filename);

    console.log(`✅ PDF exporté: ${filename}`);
  }

  // Méthodes auxiliaires pour le PDF
  private addSectionTitle(doc: jsPDF, title: string, x: number, y: number, pageWidth: number): void {
    const primaryColor: [number, number, number] = [139, 69, 19];

    doc.setFillColor(...primaryColor);
    doc.rect(x, y - 2, pageWidth - 2 * x, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 3, y + 4);
  }

  private addDataSection(
    doc: jsPDF,
    data: Array<{ label: string; value: string }>,
    x: number,
    y: number,
    pageWidth: number
  ): number {
    const lightBg: [number, number, number] = [245, 241, 232];
    const textColor: [number, number, number] = [44, 62, 80];
    let currentY = y;

    data.forEach((item, index) => {
      const itemHeight = 12;

      if (index % 2 === 0) {
        doc.setFillColor(...lightBg);
        doc.rect(x, currentY - 2, pageWidth - 2 * x, itemHeight, 'F');
      }

      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, x + 5, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(item.value, x + 70, currentY + 5);

      currentY += itemHeight;
    });

    return currentY;
  }

  private getHealthScorePDFColor(score: number): [number, number, number] {
    if (score >= 80) return [40, 167, 69]; // Vert
    if (score >= 60) return [255, 193, 7]; // Orange
    return [220, 53, 69]; // Rouge
  }
}
