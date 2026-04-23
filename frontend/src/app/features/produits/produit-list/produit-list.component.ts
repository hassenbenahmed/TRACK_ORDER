import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Produit } from '../../../models/produit.model';
import { ProduitFormComponent } from '../produit-form/produit-form.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule, MatChipsModule, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Produits</h1>
        <div class="header-actions">
          <mat-button-toggle-group [(ngModel)]="viewMode" class="view-toggle">
            <mat-button-toggle value="grid"><span class="material-symbols-outlined">grid_view</span></mat-button-toggle>
            <mat-button-toggle value="table"><span class="material-symbols-outlined">view_list</span></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button class="btn-accent" (click)="openForm()" *ngIf="isAdmin">
            <span class="material-symbols-outlined">add</span> Nouveau Produit
          </button>
        </div>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="loadProduits()">
        </mat-form-field>
        <div class="filter-chips">
          <button mat-stroked-button [class.active-chip]="filter==='all'" (click)="filter='all';loadProduits()">Tous</button>
          <button mat-stroked-button [class.active-chip]="filter==='low'" (click)="filter='low';loadLowStock()">Stock bas</button>
        </div>
      </div>

      <app-loading-skeleton *ngIf="loading" [variant]="viewMode === 'grid' ? 'card' : 'table-row'" [count]="6"></app-loading-skeleton>

      <!-- GRID VIEW -->
      <div class="product-grid" *ngIf="!loading && viewMode === 'grid' && produits.length > 0">
        <div class="product-card card-hover" *ngFor="let p of produits">
          <div class="product-image" [style.background]="getGradient(p.id)">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div class="product-info">
            <h4>{{ p.nom }}</h4>
            <p class="product-desc">{{ p.description || 'Pas de description' }}</p>
            <div class="product-footer">
              <span class="product-price">{{ p.prix | number:'1.2-2' }} €</span>
              <span class="stock-badge" [class.low]="p.stock < 10 && p.stock > 0" [class.out]="p.stock === 0" [class.ok]="p.stock >= 10">
                {{ p.stock === 0 ? 'Rupture' : p.stock + ' en stock' }}
              </span>
            </div>
          </div>
          <button mat-icon-button class="edit-btn" (click)="openForm(p)" *ngIf="isAdmin">
            <span class="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>

      <!-- TABLE VIEW -->
      <div class="card" *ngIf="!loading && viewMode === 'table' && produits.length > 0">
        <table mat-table [dataSource]="produits" class="full-table">
          <ng-container matColumnDef="nom"><th mat-header-cell *matHeaderCellDef>Nom</th><td mat-cell *matCellDef="let p" class="bold">{{ p.nom }}</td></ng-container>
          <ng-container matColumnDef="prix"><th mat-header-cell *matHeaderCellDef>Prix</th><td mat-cell *matCellDef="let p">{{ p.prix | number:'1.2-2' }} €</td></ng-container>
          <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let p">
            <span class="stock-badge" [class.low]="p.stock<10&&p.stock>0" [class.out]="p.stock===0" [class.ok]="p.stock>=10">{{ p.stock }}</span>
          </td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let p">
            <button mat-icon-button (click)="openForm(p)" *ngIf="isAdmin"><span class="material-symbols-outlined">edit</span></button>
          </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="['nom','prix','stock','actions']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['nom','prix','stock','actions']" class="hover-row"></tr>
        </table>
      </div>

      <mat-paginator [length]="totalElements" [pageSize]="12" (page)="onPageChange($event)" *ngIf="!loading && produits.length > 0"></mat-paginator>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .btn-accent { background: #FF6B35 !important; color: #fff !important; display: flex; align-items: center; gap: 6px; }
    .filters { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { width: 280px; }
    .filter-chips { display: flex; gap: 8px; }
    .active-chip { background: #1B2A4A !important; color: #fff !important; }

    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

    .product-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      border: 1px solid #F1F5F9; position: relative;
      transition: transform 200ms, box-shadow 200ms;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
    }

    .product-image {
      height: 120px; display: flex; align-items: center; justify-content: center;
      .material-symbols-outlined { font-size: 48px; color: rgba(255,255,255,0.8); }
    }

    .product-info { padding: 16px; }
    h4 { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 4px; }
    .product-desc { font-size: 13px; color: #94A3B8; margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; }
    .product-price { font-size: 18px; font-weight: 700; color: #1E293B; }

    .stock-badge {
      font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
      &.ok { background: #DCFCE7; color: #15803D; }
      &.low { background: #FEF9C3; color: #A16207; }
      &.out { background: #FEE2E2; color: #DC2626; animation: pulse 2s infinite; }
    }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

    .edit-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9); }
    .full-table { width: 100%; }
    .bold { font-weight: 600; }
    .hover-row:hover { background: #F8FAFC; }
  `]
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  loading = true;
  search = '';
  filter = 'all';
  viewMode: 'grid' | 'table' = 'grid';
  totalElements = 0;
  currentPage = 0;
  isAdmin = false;

  private gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)', 'linear-gradient(135deg, #a18cd1, #fbc2eb)'
  ];

  constructor(private produitService: ProduitService, private authService: AuthService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.produitService.getAll(this.currentPage, 12, this.search || undefined).subscribe({
      next: (page) => { this.produits = page.content; this.totalElements = page.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadLowStock(): void {
    this.loading = true;
    this.produitService.getLowStock().subscribe({
      next: (data) => { this.produits = data; this.totalElements = data.length; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm(produit?: Produit): void {
    const ref = this.dialog.open(ProduitFormComponent, { width: '560px', data: produit || null });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const obs = produit ? this.produitService.update(produit.id, result) : this.produitService.create(result);
        obs.subscribe({ next: () => { this.snackBar.open('Produit sauvegardé', 'OK', { duration: 3000 }); this.loadProduits(); } });
      }
    });
  }

  getGradient(id: number): string { return this.gradients[id % this.gradients.length]; }
  onPageChange(e: PageEvent): void { this.currentPage = e.pageIndex; this.loadProduits(); }
}

