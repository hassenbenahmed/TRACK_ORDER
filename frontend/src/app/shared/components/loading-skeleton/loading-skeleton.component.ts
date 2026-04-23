import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <ng-container [ngSwitch]="variant">
        <div *ngSwitchCase="'card'" class="skeleton-card">
          <div class="skeleton skeleton-circle"></div>
          <div class="skeleton skeleton-line w-60"></div>
          <div class="skeleton skeleton-line w-40"></div>
        </div>
        <ng-container *ngSwitchCase="'table-row'">
          <div class="skeleton-row" *ngFor="let i of rows">
            <div class="skeleton skeleton-cell" *ngFor="let j of cols"></div>
          </div>
        </ng-container>
        <div *ngSwitchDefault>
          <div class="skeleton skeleton-line" *ngFor="let i of rows" [style.width.%]="getRandomWidth(i)"></div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 400px 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 8px;
    }
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skeleton-line { height: 16px; margin-bottom: 12px; }
    .skeleton-circle { width: 48px; height: 48px; border-radius: 50%; margin-bottom: 12px; }
    .skeleton-card { padding: 24px; background: #fff; border-radius: 12px; margin-bottom: 16px; }
    .skeleton-row { display: flex; gap: 16px; margin-bottom: 12px; padding: 16px 0; border-bottom: 1px solid #f1f5f9; }
    .skeleton-cell { height: 16px; flex: 1; }
    .w-60 { width: 60%; }
    .w-40 { width: 40%; }
  `]
})
export class LoadingSkeletonComponent {
  @Input() variant: 'line' | 'card' | 'table-row' = 'line';
  @Input() count = 5;

  get rows(): number[] { return Array.from({ length: this.count }, (_, i) => i); }
  get cols(): number[] { return Array.from({ length: 5 }, (_, i) => i); }

  getRandomWidth(index: number): number {
    return 50 + ((index * 17 + 31) % 50);
  }
}

