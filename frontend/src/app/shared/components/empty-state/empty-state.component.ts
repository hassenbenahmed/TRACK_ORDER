import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <span class="material-symbols-outlined empty-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <button mat-flat-button color="primary" *ngIf="actionLabel" (click)="onAction()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
    }
    .empty-icon { font-size: 64px; color: #CBD5E1; margin-bottom: 16px; }
    h3 { font-size: 18px; font-weight: 600; color: #1E293B; margin-bottom: 8px; }
    p { font-size: 14px; color: #64748B; max-width: 400px; margin-bottom: 24px; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Aucune donnée';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionCallback: (() => void) | null = null;

  onAction(): void {
    this.actionCallback?.();
  }
}

