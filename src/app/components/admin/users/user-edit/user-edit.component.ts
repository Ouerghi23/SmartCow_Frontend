import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  loadingData = true;
  errorMessage = '';
  successMessage = '';
  userId!: number;
  showPasswordFields = false;
  showPassword = false;

  roles = [
    { value: 'ADMIN', label: '👨‍💼 Administrateur', icon: '👨‍💼' },
    { value: 'AGRONOME', label: '🔬 Agronome', icon: '🔬' },
    { value: 'ELEVEUR', label: '👨‍🌾 Éleveur', icon: '👨‍🌾' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['AGRONOME', [Validators.required]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      is_active: [true],
      password: [''],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Désactiver les champs password par défaut
    this.userForm.get('password')?.disable();
    this.userForm.get('confirmPassword')?.disable();
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    // Only validate if password is being changed
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
    }
    return null;
  }

  loadUser(): void {
    this.loadingData = true;
    this.errorMessage = '';

    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        console.log('✅ User loaded:', user);

        this.userForm.patchValue({
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone || '',
          is_active: user.is_active
        });

        this.loadingData = false;
      },
      error: (error) => {
        console.error('❌ Error loading user:', error);
        this.errorMessage = 'Impossible de charger les données de l\'utilisateur';
        this.loadingData = false;

        if (error.status === 404) {
          this.errorMessage = 'Utilisateur introuvable';
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 2000);
        }
      }
    });
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;

    if (this.showPasswordFields) {
      this.userForm.get('password')?.enable();
      this.userForm.get('confirmPassword')?.enable();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('password')?.disable();
      this.userForm.get('confirmPassword')?.disable();
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.patchValue({ password: '', confirmPassword: '' });
    }

    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Extraire les données
    const formValue = this.userForm.getRawValue();
    const { confirmPassword, ...userData } = formValue;

    // Si password est vide, ne pas l'envoyer
    if (!userData.password) {
      delete userData.password;
    }

    this.userService.updateUser(this.userId, userData).subscribe({
      next: (user) => {
        console.log('✅ User updated:', user);
        this.successMessage = 'Utilisateur modifié avec succès !';
        this.loading = false;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/users', this.userId]);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error updating user:', error);
        this.loading = false;

        if (error.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé par un autre utilisateur';
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Erreur lors de la modification de l\'utilisateur';
        }
      }
    });
  }

  onCancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/admin/users', this.userId]);
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
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched && field.enabled);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['email']) return 'Email invalide';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `Minimum ${minLength} caractères`;
      }
      if (field.errors['pattern']) return 'Format invalide';
    }

    return '';
  }

  hasPasswordMismatch(): boolean {
    return !!(this.userForm.errors?.['passwordMismatch'] &&
              this.userForm.get('confirmPassword')?.touched &&
              this.userForm.get('confirmPassword')?.enabled);
  }

  getRoleIcon(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj?.icon || '👤';
  }
}
