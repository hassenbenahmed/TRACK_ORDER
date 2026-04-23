import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';
import { Client } from '../../../models/client.model';
import { Produit } from '../../../models/produit.model';
import { Commande } from '../../../models/commande.model';
import { Observable, map, startWith, debounceTime, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-commande-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Nouvelle Commande</h1>
        <a mat-stroked-button routerLink="/commandes">← Retour</a>
      </div>

      <mat-stepper linear #stepper class="card">
        <!-- STEP 1: Client -->
        <mat-step [stepControl]="clientForm">
          <ng-template matStepLabel>Client</ng-template>
          <form [formGroup]="clientForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rechercher un client</mat-label>
              <input matInput formControlName="clientSearch" [matAutocomplete]="autoClient">
              <mat-autocomplete #autoClient="matAutocomplete" [displayWith]="displayClient" (optionSelected)="selectClient($event.option.value)">
                <mat-option *ngFor="let c of filteredClients" [value]="c">{{ c.nom }} - {{ c.email }}</mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <div class="client-preview card" *ngIf="selectedClient">
              <div class="preview-row"><span class="material-symbols-outlined">person</span>{{ selectedClient.nom }}</div>
              <div class="preview-row"><span class="material-symbols-outlined">mail</span>{{ selectedClient.email }}</div>
              <div class="preview-row"><span class="material-symbols-outlined">location_on</span>{{ selectedClient.adresse }}</div>
            </div>

            <div class="step-actions">
              <button mat-flat-button matStepperNext class="btn-accent" [disabled]="!selectedClient">Suivant</button>
            </div>
          </form>
        </mat-step>

        <!-- STEP 2: Produits -->
        <mat-step [stepControl]="produitsForm">
          <ng-template matStepLabel>Produits</ng-template>
          <form [formGroup]="produitsForm">
            <div class="lignes-header">
              <span>Produit</span><span>Qté</span><span>Prix</span><span>Sous-total</span><span></span>
            </div>
            <div class="ligne-row" *ngFor="let ligne of lignes.controls; let i = index" [formGroupName]="i">
              <mat-form-field appearance="outline" class="produit-field">
                <input matInput placeholder="Produit" [matAutocomplete]="autoProd" formControlName="produitSearch">
                <mat-autocomplete #autoProd="matAutocomplete" [displayWith]="displayProduit" (optionSelected)="selectProduit(i, $event.option.value)">
                  <mat-option *ngFor="let p of allProduits" [value]="p">{{ p.nom }} (stock: {{ p.stock }})</mat-option>
                </mat-autocomplete>
              </mat-form-field>
              <mat-form-field appearance="outline" class="qty-field">
                <input matInput type="number" formControlName="quantite" min="1" (input)="calcTotal()">
              </mat-form-field>
              <span class="prix-display">{{ ligne.get('prixUnitaire')?.value | number:'1.2-2' }} €</span>
              <span class="sous-total bold">{{ (ligne.get('prixUnitaire')?.value * ligne.get('quantite')?.value) | number:'1.2-2' }} €</span>
              <button mat-icon-button color="warn" (click)="removeLigne(i)" *ngIf="lignes.length > 1">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <button mat-stroked-button (click)="addLigne()" class="add-line-btn">
              <span class="material-symbols-outlined">add</span> Ajouter une ligne
            </button>

            <div class="total-bar">
              <span>Total :</span>
              <span class="total-value">{{ total | number:'1.2-2' }} €</span>
            </div>

            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Précédent</button>
              <button mat-flat-button matStepperNext class="btn-accent" [disabled]="lignes.length === 0">Suivant</button>
            </div>
          </form>
        </mat-step>

        <!-- STEP 3: Récap -->
        <mat-step>
          <ng-template matStepLabel>Récapitulatif</ng-template>
          <div class="recap-card card">
            <h3>Résumé de la commande</h3>
            <div class="recap-section">
              <h4>Client</h4>
              <p>{{ selectedClient?.nom }} — {{ selectedClient?.email }}</p>
            </div>
            <div class="recap-section">
              <h4>Articles</h4>
              <div class="recap-line" *ngFor="let l of lignes.controls">
                <span>{{ l.get('produitSearch')?.value?.nom || 'Produit' }} × {{ l.get('quantite')?.value }}</span>
                <span class="bold">{{ (l.get('prixUnitaire')?.value * l.get('quantite')?.value) | number:'1.2-2' }} €</span>
              </div>
              <div class="recap-total">
                <span>Total</span>
                <span>{{ total | number:'1.2-2' }} €</span>
              </div>
            </div>
          </div>
          <div class="step-actions">
            <button mat-stroked-button matStepperPrevious>Précédent</button>
            <button mat-flat-button class="btn-accent" (click)="submitOrder()" [disabled]="submitting">
              {{ submitting ? 'Création...' : 'Confirmer la commande' }}
            </button>
          </div>
        </mat-step>

        <!-- STEP 4: Confirmation -->
        <mat-step>
          <ng-template matStepLabel>Confirmation</ng-template>
          <div class="success-state" *ngIf="createdCommande">
            <div class="checkmark-circle">
              <svg viewBox="0 0 52 52" class="checkmark-svg">
                <circle cx="26" cy="26" r="25" fill="none" class="checkmark-circle-bg"/>
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" class="checkmark-check"/>
              </svg>
            </div>
            <h2>Commande créée avec succès !</h2>
            <p class="ref">{{ createdCommande.reference }}</p>
            <div class="success-actions">
              <a mat-flat-button [routerLink]="['/commandes', createdCommande.id]" class="btn-accent">Voir la commande</a>
              <a mat-stroked-button routerLink="/commandes/new">Nouvelle commande</a>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .btn-accent{background:#FF6B35!important;color:#fff!important}
    .full-width{width:100%;max-width:500px}
    .client-preview{max-width:400px;margin:16px 0}
    .preview-row{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9;.material-symbols-outlined{color:#64748B;font-size:18px}}
    .step-actions{display:flex;gap:12px;margin-top:24px}
    .lignes-header{display:grid;grid-template-columns:2fr 80px 100px 100px 40px;gap:12px;font-size:12px;font-weight:600;color:#64748B;padding:8px 0;border-bottom:1px solid #E2E8F0}
    .ligne-row{display:grid;grid-template-columns:2fr 80px 100px 100px 40px;gap:12px;align-items:center;padding:8px 0}
    .produit-field{width:100%}.qty-field{width:80px}
    .prix-display,.sous-total{font-size:14px;color:#1E293B}
    .bold{font-weight:700}
    .add-line-btn{margin-top:12px;display:flex;align-items:center;gap:4px}
    .total-bar{display:flex;justify-content:flex-end;align-items:center;gap:16px;padding:16px 0;border-top:2px solid #1B2A4A;margin-top:16px;font-size:16px;font-weight:600}
    .total-value{font-size:24px;color:#1B2A4A}
    .recap-card{max-width:600px}
    h3{font-size:18px;font-weight:700;margin-bottom:16px}
    h4{font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;margin-bottom:8px}
    .recap-section{margin-bottom:20px;p{font-size:14px}}
    .recap-line{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid #f8fafc}
    .recap-total{display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #1B2A4A;font-size:18px;font-weight:700}
    .success-state{text-align:center;padding:40px;h2{font-size:24px;margin:24px 0 8px}.ref{color:#FF6B35;font-size:18px;font-weight:700}}
    .success-actions{display:flex;gap:12px;justify-content:center;margin-top:24px}
    .checkmark-circle{width:80px;height:80px;margin:0 auto}
    .checkmark-svg{width:80px;height:80px}
    .checkmark-circle-bg{stroke:#22C55E;stroke-width:2}
    .checkmark-check{stroke:#22C55E;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;animation:checkAnim 0.6s ease 0.3s forwards}
    @keyframes checkAnim{to{stroke-dashoffset:0}}
  `]
})
export class CommandeCreateComponent implements OnInit {
  clientForm: FormGroup;
  produitsForm: FormGroup;
  selectedClient: Client | null = null;
  filteredClients: Client[] = [];
  allProduits: Produit[] = [];
  total = 0;
  submitting = false;
  createdCommande: Commande | null = null;

  constructor(
    private fb: FormBuilder, private clientService: ClientService,
    private produitService: ProduitService, private commandeService: CommandeService,
    private router: Router, private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({ clientSearch: [''] });
    this.produitsForm = this.fb.group({ lignes: this.fb.array([]) });
    this.addLigne();
  }

  get lignes(): FormArray { return this.produitsForm.get('lignes') as FormArray; }

  ngOnInit(): void {
    this.clientForm.get('clientSearch')!.valueChanges.pipe(
      debounceTime(300),
      switchMap(val => typeof val === 'string' && val.length > 1 ? this.clientService.getAll(0, 10, val) : of({ content: [] } as any))
    ).subscribe(page => this.filteredClients = page.content);

    this.produitService.getAll(0, 100).subscribe(page => this.allProduits = page.content);
  }

  selectClient(client: Client): void { this.selectedClient = client; }
  displayClient(c: Client): string { return c ? c.nom : ''; }
  displayProduit(p: Produit): string { return p ? p.nom : ''; }

  selectProduit(index: number, produit: Produit): void {
    const ligne = this.lignes.at(index);
    ligne.patchValue({ produitId: produit.id, prixUnitaire: produit.prix, produitSearch: produit });
    this.calcTotal();
  }

  addLigne(): void {
    this.lignes.push(this.fb.group({
      produitId: [null, Validators.required],
      produitSearch: [''],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0]
    }));
  }

  removeLigne(i: number): void { this.lignes.removeAt(i); this.calcTotal(); }

  calcTotal(): void {
    this.total = this.lignes.controls.reduce((sum, l) => sum + (l.get('prixUnitaire')?.value || 0) * (l.get('quantite')?.value || 0), 0);
  }

  submitOrder(): void {
    if (!this.selectedClient) return;
    this.submitting = true;
    const request = {
      clientId: this.selectedClient.id,
      lignes: this.lignes.controls.map(l => ({ produitId: l.get('produitId')?.value, quantite: l.get('quantite')?.value }))
    };
    this.commandeService.create(request).subscribe({
      next: (cmd) => { this.createdCommande = cmd; this.submitting = false; },
      error: (err) => { this.submitting = false; this.snackBar.open(err.error?.message || 'Erreur', 'OK', { duration: 4000 }); }
    });
  }
}

