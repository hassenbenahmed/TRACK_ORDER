import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  template: `
    <nav class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <span class="material-symbols-outlined logo-icon">local_shipping</span>
        <span class="logo-text" *ngIf="!collapsed">TrackOrder</span>
      </div>

      <ul class="nav-list">
        <li *ngFor="let item of navItems">
          <a [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             class="nav-link"
             [matTooltip]="collapsed ? item.label : ''"
             matTooltipPosition="right">
            <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
            <span class="nav-badge badge-pulse" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
          </a>
        </li>
      </ul>

      <button class="collapse-btn" (click)="toggleCollapse()">
        <span class="material-symbols-outlined">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
      </button>
    </nav>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #1B2A4A 0%, #2E4568 100%);
      display: flex;
      flex-direction: column;
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      overflow: hidden;

      &.collapsed { width: 72px; }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo-icon {
      font-size: 32px;
      color: #FF6B35;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
    }

    .nav-list {
      list-style: none;
      padding: 12px 8px;
      flex: 1;
      overflow-y: auto;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      transition: all 200ms ease;
      text-decoration: none;
      margin-bottom: 4px;
      position: relative;

      &:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      &.active {
        background: rgba(255,107,53,0.15);
        color: #fff;
        border-left: 3px solid #FF6B35;

        .nav-icon { color: #FF6B35; }
      }
    }

    .nav-icon { font-size: 22px; }

    .nav-label {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-badge {
      margin-left: auto;
      background: #FF6B35;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      min-width: 20px;
      text-align: center;
    }

    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      border: none;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      transition: all 200ms;

      &:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Commandes', icon: 'receipt_long', route: '/commandes', badge: 0 },
    { label: 'Livraisons', icon: 'local_shipping', route: '/livraisons' },
    { label: 'Produits', icon: 'inventory_2', route: '/produits' },
    { label: 'Clients', icon: 'people', route: '/clients' },
    { label: 'Transporteurs', icon: 'airport_shuttle', route: '/transporteurs' },
    { label: 'Paiements', icon: 'payments', route: '/paiements' }
  ];

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}

