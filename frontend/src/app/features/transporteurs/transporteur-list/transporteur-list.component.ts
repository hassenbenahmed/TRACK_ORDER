import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TransporteurService } from '../../../core/services/transporteur.service';
import { Transporteur } from '../../../models/transporteur.model';
import { TransporteurFormComponent } from '../transporteur-form/transporteur-form.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-transporteur-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatSnackBarModule, MatSlideToggleModule, LoadingSkeletonComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Transporteurs</h1>
        <button mat-flat-button class="btn-accent" (click)="openForm()">
          <span class="material-symbols-outlined">add</span> Nouveau
        </button>
      </div>

      <app-loading-skeleton *ngIf="loading" variant="table-row" [count]="5"></app-loading-skeleton>

      <div class="card" *ngIf="!loading">
        <table mat-table [dataSource]="transporteurs" class="full-table">
          <ng-container matColumnDef="nom"><th mat-header-cell *matHeaderCellDef>Nom</th><td mat-cell *matCellDef="let t" class="bold">{{ t.nom }}</td></ng-container>
          <ng-container matColumnDef="telephone"><th mat-header-cell *matHeaderCellDef>Téléphone</th><td mat-cell *matCellDef="let t">{{ t.telephone }}</td></ng-container>
          <ng-container matColumnDef="vehicule"><th mat-header-cell *matHeaderCellDef>Véhicule</th><td mat-cell *matCellDef="let t">{{ t.vehicule }}</td></ng-container>
          <ng-container matColumnDef="note"><th mat-header-cell *matHeaderCellDef>Note</th><td mat-cell *matCellDef="let t">
            <span class="stars">{{ getStars(t.note) }}</span> <span class="note-val">{{ t.note | number:'1.1-1' }}</span>
          </td></ng-container>
          <ng-container matColumnDef="livraisons"><th mat-header-cell *matHeaderCellDef>Livraisons</th><td mat-cell *matCellDef="let t">{{ t.nombreLivraisons }}</td></ng-container>
          <ng-container matColumnDef="actif"><th mat-header-cell *matHeaderCellDef>Actif</th><td mat-cell *matCellDef="let t">
            <mat-slide-toggle [checked]="t.actif" disabled></mat-slide-toggle>
          </td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let t">
            <button mat-icon-button (click)="openForm(t)"><span class="material-symbols-outlined">edit</span></button>
          </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="hover-row"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="10" (page)="onPage($event)"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .btn-accent{background:#FF6B35!important;color:#fff!important;display:flex;align-items:center;gap:6px}
    .full-table{width:100%} .bold{font-weight:600} .hover-row:hover{background:#F8FAFC}
    .stars{color:#FACC15;font-size:16px} .note-val{color:#64748B;font-size:13px;margin-left:4px}
  `]
})
export class TransporteurListComponent implements OnInit {
  transporteurs: Transporteur[] = [];
  loading = true;
  total = 0;
  page = 0;
  columns = ['nom', 'telephone', 'vehicule', 'note', 'livraisons', 'actif', 'actions'];

  constructor(private transporteurService: TransporteurService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.transporteurService.getAll(this.page, 10).subscribe({
      next: (p) => { this.transporteurs = p.content; this.total = p.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStars(note: number): string { return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note)); }

  openForm(t?: Transporteur): void {
    const ref = this.dialog.open(TransporteurFormComponent, { width: '480px', data: t || null });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const obs = t ? this.transporteurService.update(t.id, result) : this.transporteurService.create(result);
        obs.subscribe({ next: () => { this.snackBar.open('Transporteur sauvegardé', 'OK', { duration: 3000 }); this.load(); } });
      }
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.load(); }
}

