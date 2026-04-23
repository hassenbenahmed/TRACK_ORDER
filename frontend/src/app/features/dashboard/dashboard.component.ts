import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommandeService } from '../../core/services/commande.service';
import { DashboardStats } from '../../models/dashboard.model';
import { Commande } from '../../models/commande.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatTableModule, KpiCardComponent, StatusBadgeComponent, LoadingSkeletonComponent],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <h1>Bonjour, {{ username }} 👋</h1>
          <p class="subtitle">{{ today }}</p>
        </div>
      </div>

      <app-loading-skeleton *ngIf="loading" variant="card" [count]="4"></app-loading-skeleton>

      <div class="kpi-grid" *ngIf="!loading && stats">
        <app-kpi-card
          icon="receipt_long"
          [value]="stats.commandesAujourdhui"
          label="Commandes du jour"
          [color]="'linear-gradient(135deg, #1B2A4A, #3B82F6)'">
        </app-kpi-card>
        <app-kpi-card
          icon="local_shipping"
          [value]="stats.livraisonsEnCours"
          label="Livraisons en cours"
          [color]="'linear-gradient(135deg, #FF6B35, #FFA726)'">
        </app-kpi-card>
        <app-kpi-card
          icon="payments"
          [value]="stats.chiffreAffairesMois"
          label="CA du mois (€)"
          prefix=""
          suffix=" €"
          [color]="'linear-gradient(135deg, #059669, #22C55E)'">
        </app-kpi-card>
        <app-kpi-card
          icon="schedule"
          [value]="stats.paiementsEnAttente"
          label="Paiements en attente"
          [color]="'linear-gradient(135deg, #D97706, #FACC15)'">
        </app-kpi-card>
      </div>

      <div class="dashboard-grid" *ngIf="!loading">
        <div class="card chart-card">
          <h3>Répartition des commandes</h3>
          <div class="stat-bars" *ngIf="stats">
            <div class="stat-bar" *ngFor="let entry of statutEntries">
              <div class="stat-bar-header">
                <span>{{ entry.label }}</span>
                <span class="stat-count">{{ entry.count }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="entry.percent" [style.background]="entry.color"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card recent-card">
          <div class="card-header">
            <h3>Commandes récentes</h3>
            <a mat-button routerLink="/commandes" class="see-all">Voir tout</a>
          </div>
          <div class="recent-list">
            <div class="recent-item" *ngFor="let cmd of recentCommandes">
              <div class="recent-info">
                <span class="recent-ref">{{ cmd.reference }}</span>
                <span class="recent-client">{{ cmd.clientNom }}</span>
              </div>
              <div class="recent-right">
                <span class="recent-amount">{{ cmd.montantTotal | number:'1.2-2' }} €</span>
                <app-status-badge [statut]="cmd.statut"></app-status-badge>
              </div>
            </div>
            <div class="empty-recent" *ngIf="recentCommandes.length === 0">
              <span class="material-symbols-outlined">inbox</span>
              <p>Aucune commande récente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { animation: fadeInUp 0.4s ease-out; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header {
      margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: #1E293B; }
      .subtitle { color: #64748B; font-size: 14px; margin-top: 4px; }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #F1F5F9;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    h3 { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 20px; }

    .stat-bar { margin-bottom: 16px; }
    .stat-bar-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #64748B; }
    .stat-count { font-weight: 600; color: #1E293B; }
    .bar-track { height: 8px; background: #F1F5F9; border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; transition: width 1s ease-out; }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { margin-bottom: 0; } }
    .see-all { color: #FF6B35; font-size: 13px; }

    .recent-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid #F8FAFC;
      &:last-child { border-bottom: none; }
    }
    .recent-ref { font-weight: 600; font-size: 14px; color: #1E293B; display: block; }
    .recent-client { font-size: 12px; color: #64748B; }
    .recent-right { display: flex; align-items: center; gap: 12px; }
    .recent-amount { font-weight: 600; font-size: 14px; color: #1E293B; }

    .empty-recent { text-align: center; padding: 40px 0; color: #94A3B8;
      .material-symbols-outlined { font-size: 48px; margin-bottom: 8px; }
    }

    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentCommandes: Commande[] = [];
  loading = true;
  username = '';
  today = '';
  statutEntries: { label: string; count: number; percent: number; color: string }[] = [];

  private statutColors: Record<string, string> = {
    EN_ATTENTE: '#FACC15', VALIDEE: '#3B82F6', EN_COURS: '#FF6B35', LIVREE: '#22C55E', ANNULEE: '#EF4444'
  };
  private statutLabels: Record<string, string> = {
    EN_ATTENTE: 'En attente', VALIDEE: 'Validée', EN_COURS: 'En cours', LIVREE: 'Livrée', ANNULEE: 'Annulée'
  };

  constructor(
    private dashboardService: DashboardService,
    private commandeService: CommandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getCurrentUser()?.username || '';
    this.today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.buildStatutBars();
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.commandeService.getRecent(5).subscribe({
      next: (data) => this.recentCommandes = data,
      error: () => {}
    });
  }

  private buildStatutBars(): void {
    if (!this.stats) return;
    const total = Object.values(this.stats.commandesParStatut).reduce((a, b) => a + b, 0) || 1;
    this.statutEntries = Object.entries(this.stats.commandesParStatut).map(([key, count]) => ({
      label: this.statutLabels[key] || key,
      count,
      percent: (count / total) * 100,
      color: this.statutColors[key] || '#94A3B8'
    }));
  }
}

