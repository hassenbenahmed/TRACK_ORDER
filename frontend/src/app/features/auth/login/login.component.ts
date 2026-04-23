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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="auth-page">
      <div class="auth-card" [@scaleIn]>
        <div class="auth-header">
          <span class="material-symbols-outlined logo-icon">local_shipping</span>
          <h1>TrackOrder</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <input matInput formControlName="username" autocomplete="username">
            <mat-error *ngIf="form.get('username')?.hasError('required')">Requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password">
            <mat-error *ngIf="form.get('password')?.hasError('required')">Requis</mat-error>
          </mat-form-field>

          <button mat-flat-button class="submit-btn" type="submit" [disabled]="loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Se connecter</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Pas encore de compte ?</span>
          <a routerLink="/register">S'inscrire</a>
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

      .logo-icon {
        font-size: 48px;
        color: #FF6B35;
        display: block;
        margin-bottom: 12px;
      }

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1B2A4A;
        margin-bottom: 8px;
      }

      p { color: #64748B; font-size: 14px; }
    }

    .full-width { width: 100%; }

    .submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      font-weight: 600;
      background: #FF6B35 !important;
      color: #fff !important;
      border-radius: 10px;
      margin-top: 8px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #64748B;

      a { color: #FF6B35; font-weight: 600; margin-left: 4px; }
    }
  `]
})
export class LoginComponent {
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
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Identifiants incorrects', 'OK', { duration: 4000 });
      }
    });
  }
}

