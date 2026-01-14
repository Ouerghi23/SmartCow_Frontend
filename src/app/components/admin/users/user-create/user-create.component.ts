import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  roles = [
    { value: 'ADMIN', label: '👨‍💼 Administrateur', icon: '👨‍💼' },
    { value: 'AGRONOME', label: '🔬 Agronome', icon: '🔬' },
    { value: 'ELEVEUR', label: '👨‍🌾 Éleveur', icon: '👨‍🌾' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['AGRONOME', [Validators.required]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      is_active: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
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

    // Extraire les données sans confirmPassword
    const { confirmPassword, ...userData } = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        console.log('✅ User created:', user);
        this.successMessage = 'Utilisateur créé avec succès !';

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error creating user:', error);
        this.loading = false;

        if (error.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé';
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
        }
      }
    });
  }

  onCancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/admin/users']);
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
    return !!(field && field.invalid && field.touched);
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
              this.userForm.get('confirmPassword')?.touched);
  }

  getRoleIcon(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj?.icon || '👤';
  }
}
