import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paiement-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="cancel-page">
      <div class="cancel-card">
        <div class="cancel-icon">
          <span class="material-symbols-outlined">cancel</span>
        </div>
        <h1>Paiement annulé</h1>
        <p>Le paiement n'a pas été effectué. Vous pouvez réessayer.</p>
        <div class="actions">
          <a mat-flat-button routerLink="/commandes" class="btn-accent">Réessayer</a>
          <a mat-stroked-button routerLink="/dashboard">Tableau de bord</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-page{min-height:calc(100vh - 112px);display:flex;align-items:center;justify-content:center}
    .cancel-card{text-align:center;background:#fff;border-radius:24px;padding:60px 40px;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.06)}
    .cancel-icon .material-symbols-outlined{font-size:72px;color:#EF4444}
    h1{font-size:28px;font-weight:700;color:#1E293B;margin:16px 0 8px}
    p{color:#64748B;font-size:16px;margin-bottom:32px}
    .actions{display:flex;gap:12px;justify-content:center}
    .btn-accent{background:#FF6B35!important;color:#fff!important}
  `]
})
export class PaiementCancelComponent {}

