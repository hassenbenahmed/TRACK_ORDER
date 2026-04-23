import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paiement-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="success-page">
      <div class="success-card">
        <div class="checkmark-wrap">
          <svg viewBox="0 0 52 52" class="checkmark-svg">
            <circle cx="26" cy="26" r="25" fill="none" class="check-circle"/>
            <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" class="check-path"/>
          </svg>
        </div>
        <h1>Paiement réussi !</h1>
        <p>Votre paiement a été traité avec succès.</p>
        <div class="confetti"></div>
        <div class="actions">
          <a mat-flat-button routerLink="/commandes" class="btn-accent">Voir mes commandes</a>
          <a mat-stroked-button routerLink="/dashboard">Tableau de bord</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-page{min-height:calc(100vh - 112px);display:flex;align-items:center;justify-content:center}
    .success-card{text-align:center;background:#fff;border-radius:24px;padding:60px 40px;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.06);animation:scaleIn 0.5s ease-out}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
    .checkmark-wrap{width:80px;height:80px;margin:0 auto 24px}
    .checkmark-svg{width:80px;height:80px}
    .check-circle{stroke:#22C55E;stroke-width:2;fill:none;stroke-dasharray:166;stroke-dashoffset:166;animation:circleAnim 0.6s ease forwards}
    .check-path{stroke:#22C55E;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;animation:checkAnim 0.4s ease 0.5s forwards}
    @keyframes circleAnim{to{stroke-dashoffset:0}}
    @keyframes checkAnim{to{stroke-dashoffset:0}}
    h1{font-size:28px;font-weight:700;color:#1E293B;margin-bottom:8px}
    p{color:#64748B;font-size:16px;margin-bottom:32px}
    .actions{display:flex;gap:12px;justify-content:center}
    .btn-accent{background:#FF6B35!important;color:#fff!important}
  `]
})
export class PaiementSuccessComponent {}

