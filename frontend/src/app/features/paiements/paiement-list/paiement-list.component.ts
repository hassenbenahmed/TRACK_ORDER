import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaiementService } from '../../../core/services/paiement.service';
import { Paiement } from '../../../models/paiement.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-paiement-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, StatusBadgeComponent, LoadingSkeletonComponent],
  template: `
    <div class="page-container">
      <div class="page-header"><h1>Paiements</h1></div>
      <app-loading-skeleton *ngIf="loading" variant="table-row" [count]="5"></app-loading-skeleton>
      <div class="card" *ngIf="!loading">
        <table mat-table [dataSource]="paiements" class="full-table">
          <ng-container matColumnDef="commande"><th mat-header-cell *matHeaderCellDef>Commande</th><td mat-cell *matCellDef="let p" class="bold">{{ p.commandeReference }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let p">{{ p.datePaiement | date:'dd/MM/yyyy HH:mm' }}</td></ng-container>
          <ng-container matColumnDef="montant"><th mat-header-cell *matHeaderCellDef>Montant</th><td mat-cell *matCellDef="let p" class="bold">{{ p.montant | number:'1.2-2' }} €</td></ng-container>
          <ng-container matColumnDef="mode"><th mat-header-cell *matHeaderCellDef>Mode</th><td mat-cell *matCellDef="let p">
            <span class="mode-icon material-symbols-outlined" *ngIf="p.mode==='CARTE'">credit_card</span>
            <span class="mode-icon material-symbols-outlined" *ngIf="p.mode==='VIREMENT'">account_balance</span>
            <span class="mode-icon material-symbols-outlined" *ngIf="p.mode==='STRIPE'">payments</span>
            {{ p.mode }}
          </td></ng-container>
          <ng-container matColumnDef="statut"><th mat-header-cell *matHeaderCellDef>Statut</th><td mat-cell *matCellDef="let p"><app-status-badge [statut]="p.statut"></app-status-badge></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let p">
            <button mat-stroked-button *ngIf="p.statut==='REUSSI'" (click)="rembourser(p)" color="warn" class="small-btn">Rembourser</button>
          </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="hover-row"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="10" (page)="onPage($event)"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .full-table{width:100%} .bold{font-weight:600} .hover-row:hover{background:#F8FAFC}
    .mode-icon{font-size:18px;vertical-align:middle;margin-right:4px;color:#64748B}
    .small-btn{font-size:12px;padding:4px 12px}
  `]
})
export class PaiementListComponent implements OnInit {
  paiements: Paiement[] = [];
  loading = true;
  total = 0;
  page = 0;
  columns = ['commande', 'date', 'montant', 'mode', 'statut', 'actions'];

  constructor(private paiementService: PaiementService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.paiementService.getAll(this.page, 10).subscribe({
      next: (p) => { this.paiements = p.content; this.total = p.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  rembourser(p: Paiement): void {
    this.paiementService.rembourser(p.id).subscribe({
      next: () => { this.snackBar.open('Remboursement effectué', 'OK', { duration: 3000 }); this.load(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Erreur', 'OK', { duration: 4000 })
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.load(); }
}

