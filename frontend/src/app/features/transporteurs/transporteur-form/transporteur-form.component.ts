import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Transporteur } from '../../../models/transporteur.model';

@Component({
  selector: 'app-transporteur-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier' : 'Nouveau' }} Transporteur</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-stack">
        <mat-form-field appearance="outline"><mat-label>Nom</mat-label><input matInput formControlName="nom"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Téléphone</mat-label><input matInput formControlName="telephone"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Véhicule</mat-label><input matInput formControlName="vehicule"></mat-form-field>
        <mat-checkbox formControlName="actif">Actif</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button (click)="onSave()" [disabled]="form.invalid" style="background:#FF6B35;color:#fff">{{ data ? 'Modifier' : 'Créer' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.form-stack{display:flex;flex-direction:column;gap:4px} mat-form-field{width:100%}`]
})
export class TransporteurFormComponent {
  form: FormGroup;
  constructor(public dialogRef: MatDialogRef<TransporteurFormComponent>, @Inject(MAT_DIALOG_DATA) public data: Transporteur | null, fb: FormBuilder) {
    this.form = fb.group({
      nom: [data?.nom || '', Validators.required],
      telephone: [data?.telephone || '', Validators.required],
      vehicule: [data?.vehicule || ''],
      actif: [data?.actif ?? true]
    });
  }
  onSave(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

