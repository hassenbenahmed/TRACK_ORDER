import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card card-hover" [style.--gradient]="color">
      <div class="kpi-icon-wrap">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
      <div class="kpi-content">
        <div class="kpi-value" #valueEl>{{ displayValue }}</div>
        <div class="kpi-label">{{ label }}</div>
      </div>
      <div class="kpi-trend" *ngIf="trend !== undefined" [class.up]="trend >= 0" [class.down]="trend < 0">
        <span class="material-symbols-outlined">{{ trend >= 0 ? 'trending_up' : 'trending_down' }}</span>
        <span>{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
      overflow: hidden;
      border: 1px solid #F1F5F9;
      cursor: default;
    }

    .kpi-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--gradient, linear-gradient(135deg, #1B2A4A, #2E4568));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .material-symbols-outlined { color: #fff; font-size: 24px; }
    }

    .kpi-content { flex: 1; }

    .kpi-value {
      font-size: 32px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 13px;
      color: #64748B;
      margin-top: 4px;
      font-weight: 500;
    }

    .kpi-trend {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;

      &.up { color: #22C55E; }
      &.down { color: #EF4444; }

      .material-symbols-outlined { font-size: 16px; }
    }
  `]
})
export class KpiCardComponent implements OnInit {
  @Input() icon = 'info';
  @Input() value: number = 0;
  @Input() label = '';
  @Input() trend?: number;
  @Input() color = 'linear-gradient(135deg, #1B2A4A, #2E4568)';
  @Input() prefix = '';
  @Input() suffix = '';

  displayValue = '0';
  private animationFrame: any;

  ngOnInit(): void {
    this.animateCount();
  }

  private animateCount(): void {
    const duration = 1500;
    const start = performance.now();
    const target = this.value;

    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      this.displayValue = this.prefix + current.toLocaleString('fr-FR') + this.suffix;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}

