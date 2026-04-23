import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TransporteurService } from '../../../core/services/transporteur.service';
import { Transporteur } from '../../../models/transporteur.model';

@Component({
  selector: 'app-livraison-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Nouvelle Livraison</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-stack">
        <mat-form-field appearance="outline">
          <mat-label>ID Commande</mat-label>
          <input matInput type="number" formControlName="commandeId">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Transporteur</mat-label>
          <mat-select formControlName="transporteurId">
            <mat-option *ngFor="let t of transporteurs" [value]="t.id">{{ t.nom }} ({{ t.vehicule }})</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date de livraison</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dateLivraison">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Coût (€)</mat-label>
          <input matInput type="number" formControlName="cout">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button (click)="onSave()" [disabled]="form.invalid" style="background:#FF6B35;color:#fff">Créer</button>
    </mat-dialog-actions>
  `,
  styles: [`.form-stack{display:flex;flex-direction:column;gap:4px} mat-form-field{width:100%}`]
})
export class LivraisonFormComponent implements OnInit {
  form: FormGroup;
  transporteurs: Transporteur[] = [];

  constructor(
    public dialogRef: MatDialogRef<LivraisonFormComponent>,
    private fb: FormBuilder,
    private transporteurService: TransporteurService
  ) {
    this.form = this.fb.group({
      commandeId: [null, Validators.required],
      transporteurId: [null, Validators.required],
      dateLivraison: [null],
      cout: [0, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    this.transporteurService.getActifs().subscribe(list => this.transporteurs = list);
  }

  onSave(): void {
    if (this.form.valid) {
      const val = this.form.value;
      this.dialogRef.close({
        ...val,
        dateLivraison: val.dateLivraison ? new Date(val.dateLivraison).toISOString().split('T')[0] : null
      });
    }
  }
}

