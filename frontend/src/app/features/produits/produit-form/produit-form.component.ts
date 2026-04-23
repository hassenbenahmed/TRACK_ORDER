import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Produit } from '../../../models/produit.model';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline"><mat-label>Nom</mat-label><input matInput formControlName="nom"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Prix (€)</mat-label><input matInput type="number" formControlName="prix"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock</mat-label><input matInput type="number" formControlName="stock"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Image URL</mat-label><input matInput formControlName="imageUrl"></mat-form-field>
        <mat-form-field appearance="outline" class="full-span"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button (click)="onSave()" [disabled]="form.invalid" style="background:#FF6B35;color:#fff">{{ data ? 'Modifier' : 'Créer' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px} .full-span{grid-column:1/-1} mat-form-field{width:100%}`]
})
export class ProduitFormComponent {
  form: FormGroup;
  constructor(public dialogRef: MatDialogRef<ProduitFormComponent>, @Inject(MAT_DIALOG_DATA) public data: Produit | null, fb: FormBuilder) {
    this.form = fb.group({
      nom: [data?.nom || '', Validators.required],
      description: [data?.description || ''],
      prix: [data?.prix || 0, [Validators.required, Validators.min(0.01)]],
      stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
      imageUrl: [data?.imageUrl || '']
    });
  }
  onSave(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

