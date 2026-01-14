import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CowService } from '../../../../services/cow.service';

@Component({
  selector: 'app-cow-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cow-edit.component.html',
  styleUrls: ['./cow-edit.component.css']
})
export class CowEditComponent implements OnInit {
  cowForm!: FormGroup;
  loading = false;
  loadingData = true;
  errorMessage = '';
  successMessage = '';
  cowId!: number;

  // Liste des races communes
  breeds = [
    'Holstein',
    'Montbéliarde',
    'Normande',
    'Brune des Alpes',
    'Jersiaise',
    'Charolaise',
    'Limousine',
    'Tarentaise',
    'Abondance',
    'Autre'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private cowService: CowService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      this.cowId = +params['id'];
      this.loadCow();
    });
  }

  initForm(): void {
    this.cowForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tag_id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      breed: ['', [Validators.maxLength(100)]],
      birth_date: [''],
      weight: ['', [Validators.min(0), Validators.max(2000)]],
      photo_url: ['', [Validators.maxLength(500)]],
      notes: ['', [Validators.maxLength(2000)]],
      health_score: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      is_active: [true]
    });
  }

  loadCow(): void {
    this.loadingData = true;
    this.errorMessage = '';

    this.cowService.getCow(this.cowId).subscribe({
      next: (cow) => {
        console.log('✅ Cow loaded:', cow);

        // Formater la date pour input date
        let birthDateFormatted = '';
        if (cow.birth_date) {
          const date = new Date(cow.birth_date);
          birthDateFormatted = date.toISOString().split('T')[0];
        }

        this.cowForm.patchValue({
          name: cow.name,
          tag_id: cow.tag_id,
          breed: cow.breed || '',
          birth_date: birthDateFormatted,
          weight: cow.weight || '',
          photo_url: cow.photo_url || '',
          notes: cow.notes || '',
          health_score: cow.health_score,
          is_active: cow.is_active
        });

        this.loadingData = false;
      },
      error: (error) => {
        console.error('❌ Error loading cow:', error);
        this.errorMessage = 'Impossible de charger les données de la vache';
        this.loadingData = false;

        if (error.status === 404) {
          this.errorMessage = 'Vache introuvable';
          setTimeout(() => {
            this.router.navigate(['/admin/cows']);
          }, 2000);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.cowForm.invalid) {
      this.markFormGroupTouched(this.cowForm);
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données
    const cowData = { ...this.cowForm.value };

    // Convertir les champs vides en null
    if (!cowData.breed) cowData.breed = null;
    if (!cowData.birth_date) cowData.birth_date = null;
    if (!cowData.weight) cowData.weight = null;
    if (!cowData.photo_url) cowData.photo_url = null;
    if (!cowData.notes) cowData.notes = null;

    this.cowService.updateCow(this.cowId, cowData).subscribe({
      next: (cow) => {
        console.log('✅ Cow updated:', cow);
        this.successMessage = 'Vache modifiée avec succès !';
        this.loading = false;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/cows', this.cowId]);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error updating cow:', error);
        this.loading = false;

        if (error.status === 409) {
          this.errorMessage = 'Ce numéro de boucle (Tag ID) est déjà utilisé par une autre vache';
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Erreur lors de la modification de la vache';
        }
      }
    });
  }

  onCancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/admin/cows', this.cowId]);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cowForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.cowForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `Minimum ${minLength} caractères`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Maximum ${maxLength} caractères`;
      }
      if (field.errors['min']) {
        const min = field.errors['min'].min;
        return `Valeur minimale: ${min}`;
      }
      if (field.errors['max']) {
        const max = field.errors['max'].max;
        return `Valeur maximale: ${max}`;
      }
    }

    return '';
  }

  getHealthScoreClass(): string {
    const score = this.cowForm.get('health_score')?.value || 0;
    if (score >= 80) return 'health-good';
    if (score >= 60) return 'health-warning';
    return 'health-critical';
  }

  getHealthScoreLabel(): string {
    const score = this.cowForm.get('health_score')?.value || 0;
    if (score >= 80) return '✅ Excellente santé';
    if (score >= 60) return '⚠️ Santé correcte';
    return '🔴 Santé critique';
  }

  // Calculer l'âge estimé
  getEstimatedAge(): string {
    const birthDate = this.cowForm.get('birth_date')?.value;
    if (!birthDate) return 'N/A';

    const birth = new Date(birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const ageInYears = (ageInDays / 365.25).toFixed(1);

    if (ageInDays < 365) {
      return `${Math.floor(ageInDays / 30)} mois`;
    }
    return `${ageInYears} ans`;
  }
}
