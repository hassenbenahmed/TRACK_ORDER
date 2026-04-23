import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ClientService } from '../../../core/services/client.service';
import { CommandeService } from '../../../core/services/commande.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Client } from '../../../models/client.model';
import { Commande } from '../../../models/commande.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatTableModule, StatusBadgeComponent],
  template: `
    <div class="page-container" *ngIf="client">
      <div class="page-header">
        <div>
          <h1>{{ client.nom }}</h1>
          <p class="subtitle">Client depuis {{ client.createdAt | date:'longDate' }}</p>
        </div>
        <a mat-stroked-button routerLink="/clients">← Retour</a>
      </div>

      <div class="info-grid">
        <div class="card info-card">
          <div class="info-row"><span class="material-symbols-outlined">mail</span><span>{{ client.email }}</span></div>
          <div class="info-row"><span class="material-symbols-outlined">call</span><span>{{ client.telephone || 'N/A' }}</span></div>
          <div class="info-row"><span class="material-symbols-outlined">location_on</span><span>{{ client.adresse }}</span></div>
        </div>
      </div>

      <div class="card" style="margin-top:24px">
        <h3>Historique des commandes</h3>
        <table mat-table [dataSource]="commandes" class="full-table" *ngIf="commandes.length > 0">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let c"><a [routerLink]="['/commandes', c.id]" class="link">{{ c.reference }}</a></td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let c">{{ c.dateCommande | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="montant">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let c" class="bold">{{ c.montantTotal | number:'1.2-2' }} €</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let c"><app-status-badge [statut]="c.statut"></app-status-badge></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['reference','date','montant','statut']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['reference','date','montant','statut']"></tr>
        </table>
        <p *ngIf="commandes.length === 0" class="no-data">Aucune commande pour ce client</p>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #64748B; font-size: 14px; margin-top: 4px; }
    .info-card { max-width: 500px; }
    .info-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #1E293B;
      .material-symbols-outlined { color: #64748B; font-size: 20px; } }
    .full-table { width: 100%; }
    .link { color: #1B2A4A; font-weight: 600; &:hover { color: #FF6B35; } }
    .bold { font-weight: 600; }
    h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .no-data { color: #94A3B8; text-align: center; padding: 32px; }
  `]
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  commandes: Commande[] = [];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientService.getById(id).subscribe(c => this.client = c);
    this.commandeService.getByClient(id).subscribe(page => this.commandes = page.content);
  }
}

