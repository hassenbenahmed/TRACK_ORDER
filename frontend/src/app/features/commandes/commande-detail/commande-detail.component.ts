import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommandeService } from '../../../core/services/commande.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { Commande } from '../../../models/commande.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TimelineComponent, TimelineStep } from '../../../shared/components/timeline/timeline.component';

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatTableModule, MatSnackBarModule, MatDialogModule, StatusBadgeComponent, TimelineComponent],
  template: `
    <div class="page-container" *ngIf="commande">
      <div class="page-header">
        <div>
          <div class="ref-line">
            <h1>{{ commande.reference }}</h1>
            <app-status-badge [statut]="commande.statut" class="big-badge"></app-status-badge>
          </div>
          <p class="subtitle">{{ commande.dateCommande | date:'dd MMMM yyyy à HH:mm' }} — {{ commande.clientNom }}</p>
        </div>
        <a mat-stroked-button routerLink="/commandes">← Retour</a>
      </div>

      <div class="detail-grid">
        <div class="left-col">
          <!-- Timeline -->
          <div class="card">
            <h3>Progression</h3>
            <app-timeline [steps]="timelineSteps"></app-timeline>
          </div>

          <!-- Articles -->
          <div class="card" style="margin-top:20px">
            <h3>Articles</h3>
            <table mat-table [dataSource]="commande.lignes" class="full-table">
              <ng-container matColumnDef="produit"><th mat-header-cell *matHeaderCellDef>Produit</th><td mat-cell *matCellDef="let l">{{ l.produitNom }}</td></ng-container>
              <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef>Qté</th><td mat-cell *matCellDef="let l">{{ l.quantite }}</td></ng-container>
              <ng-container matColumnDef="prix"><th mat-header-cell *matHeaderCellDef>Prix unit.</th><td mat-cell *matCellDef="let l">{{ l.prixUnitaire | number:'1.2-2' }} €</td></ng-container>
              <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Sous-total</th><td mat-cell *matCellDef="let l" class="bold">{{ l.sousTotal | number:'1.2-2' }} €</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="['produit','qty','prix','total']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['produit','qty','prix','total']"></tr>
            </table>
            <div class="total-row">
              <span>Total</span>
              <span class="total-value">{{ commande.montantTotal | number:'1.2-2' }} €</span>
            </div>
          </div>
        </div>

        <div class="right-col">
          <!-- Actions -->
          <div class="card actions-card">
            <h3>Actions</h3>
            <button mat-flat-button class="action-btn success" (click)="valider()" *ngIf="commande.statut==='EN_ATTENTE'">
              <span class="material-symbols-outlined">check_circle</span> Valider
            </button>
            <button mat-flat-button class="action-btn danger" (click)="annuler()" *ngIf="commande.statut!=='LIVREE'&&commande.statut!=='ANNULEE'">
              <span class="material-symbols-outlined">cancel</span> Annuler
            </button>
            <button mat-flat-button class="action-btn accent" (click)="payer()" *ngIf="commande.statut!=='ANNULEE'&&!commande.paiement">
              <span class="material-symbols-outlined">payment</span> Procéder au paiement
            </button>
          </div>

          <!-- Livraison -->
          <div class="card" style="margin-top:16px">
            <h3>Livraison</h3>
            <div *ngIf="commande.livraison; else noLivraison">
              <div class="info-line"><span>Transporteur</span><span class="bold">{{ commande.livraison.transporteurNom }}</span></div>
              <div class="info-line"><span>Date</span><span>{{ commande.livraison.dateLivraison | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-line"><span>Statut</span><app-status-badge [statut]="commande.livraison.statut"></app-status-badge></div>
            </div>
            <ng-template #noLivraison>
              <p class="no-data">Non assignée</p>
              <a mat-stroked-button routerLink="/livraisons" *ngIf="commande.statut==='VALIDEE'">Assigner un transporteur</a>
            </ng-template>
          </div>

          <!-- Paiement -->
          <div class="card" style="margin-top:16px">
            <h3>Paiement</h3>
            <div *ngIf="commande.paiement; else noPaiement">
              <div class="info-line"><span>Mode</span><app-status-badge [statut]="commande.paiement.mode" type="mode"></app-status-badge></div>
              <div class="info-line"><span>Statut</span><app-status-badge [statut]="commande.paiement.statut"></app-status-badge></div>
              <div class="info-line"><span>Montant</span><span class="bold">{{ commande.paiement.montant | number:'1.2-2' }} €</span></div>
            </div>
            <ng-template #noPaiement><p class="no-data">Aucun paiement</p></ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ref-line{display:flex;align-items:center;gap:16px}
    .big-badge{font-size:14px}
    .subtitle{color:#64748B;font-size:14px;margin-top:4px}
    .detail-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:24px}
    .card{background:#fff;border-radius:16px;padding:24px;border:1px solid #F1F5F9}
    h3{font-size:16px;font-weight:600;margin-bottom:16px}
    .full-table{width:100%}
    .bold{font-weight:700}
    .total-row{display:flex;justify-content:space-between;padding:16px 0;border-top:2px solid #1B2A4A;margin-top:12px;font-size:16px;font-weight:600}
    .total-value{font-size:20px}
    .action-btn{width:100%;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px}
    .success{background:#22C55E!important;color:#fff!important}
    .danger{background:#EF4444!important;color:#fff!important}
    .accent{background:#FF6B35!important;color:#fff!important}
    .info-line{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f8fafc;font-size:14px}
    .no-data{color:#94A3B8;font-size:14px;text-align:center;padding:16px}
    @media(max-width:768px){.detail-grid{grid-template-columns:1fr}}
  `]
})
export class CommandeDetailComponent implements OnInit {
  commande: Commande | null = null;
  timelineSteps: TimelineStep[] = [];

  constructor(
    private route: ActivatedRoute, private commandeService: CommandeService,
    private paiementService: PaiementService, private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadCommande(); }

  loadCommande(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.commandeService.getById(id).subscribe(cmd => {
      this.commande = cmd;
      this.buildTimeline();
    });
  }

  buildTimeline(): void {
    if (!this.commande) return;
    const s = this.commande.statut;
    const statuts = ['EN_ATTENTE', 'VALIDEE', 'EN_COURS', 'LIVREE'];
    const labels = ['En attente', 'Validée', 'En cours', 'Livrée'];
    const idx = statuts.indexOf(s);

    if (s === 'ANNULEE') {
      this.timelineSteps = labels.map((label, i) => ({ label, active: false, completed: false }));
      this.timelineSteps.push({ label: 'Annulée', active: true, completed: false, error: true });
    } else {
      this.timelineSteps = labels.map((label, i) => ({
        label, active: i === idx, completed: i < idx
      }));
    }
  }

  valider(): void {
    this.commandeService.valider(this.commande!.id).subscribe({
      next: () => { this.snackBar.open('Commande validée', 'OK', { duration: 3000 }); this.loadCommande(); }
    });
  }

  annuler(): void {
    this.commandeService.annuler(this.commande!.id).subscribe({
      next: () => { this.snackBar.open('Commande annulée', 'OK', { duration: 3000 }); this.loadCommande(); }
    });
  }

  payer(): void {
    this.paiementService.createCheckout(this.commande!.id).subscribe({
      next: (res) => window.location.href = res.checkoutUrl,
      error: (err) => this.snackBar.open(err.error?.message || 'Erreur paiement', 'OK', { duration: 4000 })
    });
  }
}

