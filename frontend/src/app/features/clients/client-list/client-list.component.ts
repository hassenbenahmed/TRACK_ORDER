import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../models/client.model';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSnackBarModule, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Clients</h1>
        <button mat-flat-button class="btn-accent" (click)="openForm()">
          <span class="material-symbols-outlined">add</span>
          Nouveau Client
        </button>
      </div>

      <div class="card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher un client</mat-label>
            <input matInput [(ngModel)]="search" (keyup.enter)="loadClients()" placeholder="Nom...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <app-loading-skeleton *ngIf="loading" variant="table-row" [count]="5"></app-loading-skeleton>

        <app-empty-state *ngIf="!loading && clients.length === 0"
          icon="people" title="Aucun client" description="Commencez par ajouter un client"
          actionLabel="Nouveau Client" [actionCallback]="openForm.bind(this)">
        </app-empty-state>

        <table mat-table [dataSource]="clients" *ngIf="!loading && clients.length > 0" class="full-table">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let c">
              <a [routerLink]="['/clients', c.id]" class="link-primary">{{ c.nom }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email }}</td>
          </ng-container>
          <ng-container matColumnDef="telephone">
            <th mat-header-cell *matHeaderCellDef>Téléphone</th>
            <td mat-cell *matCellDef="let c">{{ c.telephone }}</td>
          </ng-container>
          <ng-container matColumnDef="commandes">
            <th mat-header-cell *matHeaderCellDef>Commandes</th>
            <td mat-cell *matCellDef="let c">{{ c.nombreCommandes }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button (click)="openForm(c)"><span class="material-symbols-outlined">edit</span></button>
              <button mat-icon-button color="warn" (click)="deleteClient(c)"><span class="material-symbols-outlined">delete</span></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover-row"></tr>
        </table>

        <mat-paginator [length]="totalElements" [pageSize]="10" [pageSizeOptions]="[5,10,25]"
                        (page)="onPageChange($event)" *ngIf="!loading && clients.length > 0">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .btn-accent { background: #FF6B35 !important; color: #fff !important; display: flex; align-items: center; gap: 6px; }
    .table-toolbar { margin-bottom: 16px; }
    .search-field { width: 320px; }
    .full-table { width: 100%; }
    .link-primary { color: #1B2A4A; font-weight: 600; &:hover { color: #FF6B35; } }
    .hover-row:hover { background: #F8FAFC; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  loading = true;
  search = '';
  totalElements = 0;
  currentPage = 0;
  displayedColumns = ['nom', 'email', 'telephone', 'commandes', 'actions'];

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll(this.currentPage, 10, this.search || undefined).subscribe({
      next: (page) => {
        this.clients = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openForm(client?: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '560px',
      data: client || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const obs = client
          ? this.clientService.update(client.id, result)
          : this.clientService.create(result);
        obs.subscribe({
          next: () => {
            this.snackBar.open(client ? 'Client modifié' : 'Client créé', 'OK', { duration: 3000 });
            this.loadClients();
          },
          error: () => this.snackBar.open('Erreur', 'OK', { duration: 3000 })
        });
      }
    });
  }

  deleteClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Supprimer le client', message: `Voulez-vous supprimer ${client.nom} ?`, danger: true, confirmText: 'Supprimer' }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.delete(client.id).subscribe({
          next: () => {
            this.snackBar.open('Client supprimé', 'OK', { duration: 3000 });
            this.loadClients();
          }
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.loadClients();
  }
}

