import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar [collapsed]="sidebarCollapsed" (collapsedChange)="sidebarCollapsed = $event"></app-sidebar>
      <div class="main-content">
        <app-topbar></app-topbar>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 100vh;
      background: #F8FAFC;
    }

    .sidebar-collapsed .main-content {
      margin-left: 72px;
    }

    .content-area {
      padding: 24px;
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
}

