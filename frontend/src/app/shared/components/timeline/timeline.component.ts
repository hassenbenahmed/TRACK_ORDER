import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineStep {
  label: string;
  date?: string;
  active: boolean;
  completed: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline">
      <div class="timeline-step" *ngFor="let step of steps; let last = last"
           [class.completed]="step.completed"
           [class.active]="step.active"
           [class.error]="step.error">
        <div class="step-dot">
          <span class="material-symbols-outlined" *ngIf="step.completed && !step.error">check</span>
          <span class="material-symbols-outlined" *ngIf="step.error">close</span>
        </div>
        <div class="step-content">
          <div class="step-label">{{ step.label }}</div>
          <div class="step-date" *ngIf="step.date">{{ step.date }}</div>
        </div>
        <div class="step-line" *ngIf="!last"></div>
      </div>
    </div>
  `,
  styles: [`
    .timeline { display: flex; flex-direction: column; gap: 0; }

    .timeline-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      padding-bottom: 24px;
    }

    .step-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
      transition: all 300ms ease;

      .material-symbols-outlined { font-size: 16px; color: #fff; }
    }

    .step-line {
      position: absolute;
      left: 15px;
      top: 32px;
      width: 2px;
      height: calc(100% - 32px);
      background: #E2E8F0;
    }

    .completed {
      .step-dot { background: #22C55E; }
      .step-line { background: #22C55E; }
      .step-label { color: #1E293B; }
    }

    .active {
      .step-dot {
        background: #FF6B35;
        box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2);
        animation: pulse-dot 2s ease-in-out infinite;
      }
      .step-label { color: #FF6B35; font-weight: 600; }
    }

    .error {
      .step-dot { background: #EF4444; }
      .step-label { color: #EF4444; }
    }

    @keyframes pulse-dot {
      0%, 100% { box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2); }
      50% { box-shadow: 0 0 0 8px rgba(255, 107, 53, 0.1); }
    }

    .step-label { font-size: 14px; font-weight: 500; color: #94A3B8; }
    .step-date { font-size: 12px; color: #94A3B8; margin-top: 2px; }
  `]
})
export class TimelineComponent {
  @Input() steps: TimelineStep[] = [];
}

