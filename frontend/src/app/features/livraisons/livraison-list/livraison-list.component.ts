import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LivraisonService } from '../../../core/services/livraison.service';
import { Livraison, LivraisonStatut } from '../../../models/livraison.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { LivraisonFormComponent } from '../livraison-form/livraison-form.component';

interface KanbanColumn {
  statut: LivraisonStatut;
  label: string;
  color: string;
  items: Livraison[];
}

@Component({
  selector: 'app-livraison-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatSnackBarModule, DragDropModule, StatusBadgeComponent, LoadingSkeletonComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Livraisons</h1>
        <div class="header-actions">
          <mat-button-toggle-group [(ngModel)]="viewMode">
            <mat-button-toggle value="kanban"><span class="material-symbols-outlined">view_kanban</span></mat-button-toggle>
            <mat-button-toggle value="list"><span class="material-symbols-outlined">view_list</span></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button class="btn-accent" (click)="openForm()">
            <span class="material-symbols-outlined">add</span> Nouvelle Livraison
          </button>
        </div>
      </div>

      <app-loading-skeleton *ngIf="loading" variant="card" [count]="4"></app-loading-skeleton>

      <!-- KANBAN VIEW -->
      <div class="kanban-board" *ngIf="!loading && viewMode === 'kanban'">
        <div class="kanban-column" *ngFor="let col of columns"
             cdkDropList [cdkDropListData]="col.items"
             [cdkDropListConnectedTo]="columnIds"
             [id]="col.statut"
             (cdkDropListDropped)="onDrop($event, col)">
          <div class="column-header" [style.border-color]="col.color">
            <span class="column-title">{{ col.label }}</span>
            <span class="column-count" [style.background]="col.color">{{ col.items.length }}</span>
          </div>
          <div class="kanban-card" *ngFor="let item of col.items" cdkDrag
               [cdkDragData]="item">
            <div class="kanban-ref">{{ item.commandeReference }}</div>
            <div class="kanban-client">{{ item.clientNom }}</div>
            <div class="kanban-footer">
              <div class="kanban-transporteur">
                <div class="avatar-xs">{{ item.transporteurNom?.charAt(0) }}</div>
                <span>{{ item.transporteurNom }}</span>
              </div>
              <span class="kanban-date">{{ item.dateLivraison | date:'dd/MM' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LIST VIEW -->
      <div class="card" *ngIf="!loading && viewMode === 'list'">
        <table mat-table [dataSource]="allLivraisons" class="full-table">
          <ng-container matColumnDef="commande"><th mat-header-cell *matHeaderCellDef>Commande</th><td mat-cell *matCellDef="let l" class="bold">{{ l.commandeReference }}</td></ng-container>
          <ng-container matColumnDef="client"><th mat-header-cell *matHeaderCellDef>Client</th><td mat-cell *matCellDef="let l">{{ l.clientNom }}</td></ng-container>
          <ng-container matColumnDef="transporteur"><th mat-header-cell *matHeaderCellDef>Transporteur</th><td mat-cell *matCellDef="let l">{{ l.transporteurNom }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let l">{{ l.dateLivraison | date:'dd/MM/yyyy' }}</td></ng-container>
          <ng-container matColumnDef="statut"><th mat-header-cell *matHeaderCellDef>Statut</th><td mat-cell *matCellDef="let l"><app-status-badge [statut]="l.statut"></app-status-badge></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="['commande','client','transporteur','date','statut']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['commande','client','transporteur','date','statut']" class="hover-row"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-actions{display:flex;gap:12px;align-items:center}
    .btn-accent{background:#FF6B35!important;color:#fff!important;display:flex;align-items:center;gap:6px}

    .kanban-board{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;min-height:500px}
    .kanban-column{background:#F1F5F9;border-radius:12px;padding:12px;min-height:400px}
    .column-header{display:flex;justify-content:space-between;align-items:center;padding:8px 4px 12px;border-bottom:3px solid;margin-bottom:12px}
    .column-title{font-size:14px;font-weight:600;color:#1E293B}
    .column-count{color:#fff;font-size:12px;font-weight:700;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center}

    .kanban-card{
      background:#fff;border-radius:10px;padding:14px;margin-bottom:10px;cursor:grab;
      border:1px solid #E2E8F0;transition:box-shadow 200ms,transform 200ms;
      &:hover{box-shadow:0 4px 12px rgba(0,0,0,0.08)}
    }
    .cdk-drag-preview{box-shadow:0 8px 24px rgba(0,0,0,0.15);transform:scale(1.02);border-radius:10px}
    .cdk-drag-placeholder{opacity:0.4}
    .cdk-drag-animating{transition:transform 250ms ease}

    .kanban-ref{font-weight:700;font-size:14px;color:#1B2A4A;margin-bottom:4px}
    .kanban-client{font-size:13px;color:#64748B;margin-bottom:10px}
    .kanban-footer{display:flex;justify-content:space-between;align-items:center}
    .kanban-transporteur{display:flex;align-items:center;gap:6px;font-size:12px;color:#1E293B}
    .avatar-xs{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#1B2A4A,#2E4568);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
    .kanban-date{font-size:12px;color:#94A3B8}

    .full-table{width:100%}
    .bold{font-weight:600}
    .hover-row:hover{background:#F8FAFC}

    @media(max-width:1024px){.kanban-board{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:640px){.kanban-board{grid-template-columns:1fr}}
  `]
})
export class LivraisonListComponent implements OnInit {
  viewMode: 'kanban' | 'list' = 'kanban';
  loading = true;
  allLivraisons: Livraison[] = [];
  columns: KanbanColumn[] = [
    { statut: 'PREPAREE', label: 'Préparée', color: '#3B82F6', items: [] },
    { statut: 'EN_TRANSIT', label: 'En Transit', color: '#FF6B35', items: [] },
    { statut: 'LIVREE', label: 'Livrée', color: '#22C55E', items: [] },
    { statut: 'ECHOUEE', label: 'Échouée', color: '#EF4444', items: [] }
  ];
  columnIds: string[] = ['PREPAREE', 'EN_TRANSIT', 'LIVREE', 'ECHOUEE'];

  constructor(private livraisonService: LivraisonService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.livraisonService.getAll(0, 100).subscribe({
      next: (page) => {
        this.allLivraisons = page.content;
        this.columns.forEach(col => col.items = this.allLivraisons.filter(l => l.statut === col.statut));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onDrop(event: CdkDragDrop<Livraison[]>, targetCol: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.livraisonService.updateStatut(item.id, targetCol.statut).subscribe({
        next: () => this.snackBar.open(`Livraison → ${targetCol.label}`, 'OK', { duration: 2000 }),
        error: () => { this.loadAll(); this.snackBar.open('Erreur', 'OK', { duration: 3000 }); }
      });
    }
  }

  openForm(): void {
    const ref = this.dialog.open(LivraisonFormComponent, { width: '500px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.livraisonService.create(result).subscribe({
          next: () => { this.snackBar.open('Livraison créée', 'OK', { duration: 3000 }); this.loadAll(); }
        });
      }
    });
  }
}

