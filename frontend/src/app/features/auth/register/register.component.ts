import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="material-symbols-outlined logo-icon">local_shipping</span>
          <h1>Créer un compte</h1>
          <p>Rejoignez TrackOrder</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <input matInput formControlName="username">
            <mat-error *ngIf="form.get('username')?.hasError('required')">Requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Minimum 6 caractères</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le mot de passe</mat-label>
            <input matInput type="password" formControlName="confirmPassword">
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('mismatch')">Les mots de passe ne correspondent pas</mat-error>
          </mat-form-field>

          <button mat-flat-button class="submit-btn" type="submit" [disabled]="loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">S'inscrire</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Déjà un compte ?</span>
          <a routerLink="/login">Se connecter</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1B2A4A 0%, #2E4568 100%);
      padding: 24px;
    }
    .auth-card {
      background: #fff;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      animation: scaleInAnim 0.4s ease-out;
    }
    @keyframes scaleInAnim {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
      .logo-icon { font-size: 48px; color: #FF6B35; display: block; margin-bottom: 12px; }
      h1 { font-size: 24px; font-weight: 700; color: #1B2A4A; margin-bottom: 8px; }
      p { color: #64748B; font-size: 14px; }
    }
    .full-width { width: 100%; }
    .submit-btn {
      width: 100%; padding: 12px; font-size: 15px; font-weight: 600;
      background: #FF6B35 !important; color: #fff !important;
      border-radius: 10px; margin-top: 8px; height: 48px;
      display: flex; align-items: center; justify-content: center;
    }
    .auth-footer {
      text-align: center; margin-top: 24px; font-size: 14px; color: #64748B;
      a { color: #FF6B35; font-weight: 600; margin-left: 4px; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.form.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }
    this.loading = true;

    const { username, email, password } = this.form.value;
    this.authService.register({ username, email, password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erreur lors de l\'inscription', 'OK', { duration: 4000 });
      }
    });
  }
}

