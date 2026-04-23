import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommandeService } from '../../../core/services/commande.service';
import { Commande, CommandeStatut } from '../../../models/commande.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatMenuModule, MatIconModule, MatSnackBarModule, StatusBadgeComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Commandes</h1>
        <a mat-flat-button routerLink="/commandes/new" class="btn-accent">
          <span class="material-symbols-outlined">add</span> Nouvelle Commande
        </a>
      </div>

      <div class="filters-bar">
        <div class="status-chips">
          <button mat-stroked-button [class.active-chip]="!selectedStatut" (click)="selectedStatut=undefined;loadCommandes()">Toutes</button>
          <button mat-stroked-button *ngFor="let s of statuts" [class.active-chip]="selectedStatut===s.value"
                  (click)="selectedStatut=s.value;loadCommandes()">{{ s.label }}</button>
        </div>
      </div>

      <app-loading-skeleton *ngIf="loading" variant="table-row" [count]="5"></app-loading-skeleton>

      <div class="card" *ngIf="!loading && commandes.length > 0">
        <table mat-table [dataSource]="commandes" class="full-table">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let c"><a [routerLink]="['/commandes', c.id]" class="link-primary">{{ c.reference }}</a></td>
          </ng-container>
          <ng-container matColumnDef="client">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let c">
              <div class="client-cell">
                <div class="avatar-sm">{{ c.clientNom?.charAt(0) }}</div>
                <span>{{ c.clientNom }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let c">{{ c.dateCommande | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="articles">
            <th mat-header-cell *matHeaderCellDef>Articles</th>
            <td mat-cell *matCellDef="let c">{{ c.lignes?.length || 0 }}</td>
          </ng-container>
          <ng-container matColumnDef="montant">
            <th mat-header-cell *matHeaderCellDef>Montant</th>
            <td mat-cell *matCellDef="let c" class="bold">{{ c.montantTotal | number:'1.2-2' }} €</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let c"><app-status-badge [statut]="c.statut"></app-status-badge></td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu"><span class="material-symbols-outlined">more_vert</span></button>
              <mat-menu #actionMenu="matMenu">
                <a mat-menu-item [routerLink]="['/commandes', c.id]"><span class="material-symbols-outlined">visibility</span> Voir</a>
                <button mat-menu-item (click)="valider(c)" *ngIf="c.statut==='EN_ATTENTE'"><span class="material-symbols-outlined">check_circle</span> Valider</button>
                <button mat-menu-item (click)="annuler(c)" *ngIf="c.statut!=='LIVREE'&&c.statut!=='ANNULEE'"><span class="material-symbols-outlined">cancel</span> Annuler</button>
              </mat-menu>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" class="hover-row"></tr>
        </table>
        <mat-paginator [length]="totalElements" [pageSize]="10" (page)="onPage($event)"></mat-paginator>
      </div>

      <app-empty-state *ngIf="!loading && commandes.length===0" icon="receipt_long" title="Aucune commande"></app-empty-state>
    </div>
  `,
  styles: [`
    .btn-accent{background:#FF6B35!important;color:#fff!important;display:flex;align-items:center;gap:6px}
    .filters-bar{margin-bottom:20px}
    .status-chips{display:flex;gap:8px;flex-wrap:wrap}
    .active-chip{background:#1B2A4A!important;color:#fff!important}
    .full-table{width:100%}
    .link-primary{color:#1B2A4A;font-weight:600;&:hover{color:#FF6B35}}
    .client-cell{display:flex;align-items:center;gap:8px}
    .avatar-sm{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1B2A4A,#2E4568);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
    .bold{font-weight:600}
    .hover-row:hover{background:#F8FAFC}
  `]
})
export class CommandeListComponent implements OnInit {
  commandes: Commande[] = [];
  loading = true;
  totalElements = 0;
  currentPage = 0;
  selectedStatut?: CommandeStatut;
  displayedColumns = ['reference', 'client', 'date', 'articles', 'montant', 'statut', 'actions'];
  statuts = [
    { value: 'EN_ATTENTE' as CommandeStatut, label: 'En attente' },
    { value: 'VALIDEE' as CommandeStatut, label: 'Validée' },
    { value: 'EN_COURS' as CommandeStatut, label: 'En cours' },
    { value: 'LIVREE' as CommandeStatut, label: 'Livrée' },
    { value: 'ANNULEE' as CommandeStatut, label: 'Annulée' }
  ];

  constructor(private commandeService: CommandeService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.loadCommandes(); }

  loadCommandes(): void {
    this.loading = true;
    this.commandeService.getAll(this.currentPage, 10, this.selectedStatut).subscribe({
      next: (page) => { this.commandes = page.content; this.totalElements = page.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  valider(c: Commande): void {
    this.commandeService.valider(c.id).subscribe({ next: () => { this.snackBar.open('Commande validée', 'OK', { duration: 3000 }); this.loadCommandes(); } });
  }

  annuler(c: Commande): void {
    this.commandeService.annuler(c.id).subscribe({ next: () => { this.snackBar.open('Commande annulée', 'OK', { duration: 3000 }); this.loadCommandes(); } });
  }

  onPage(e: PageEvent): void { this.currentPage = e.pageIndex; this.loadCommandes(); }
}

