import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h2 class="page-title">{{ getGreeting() }}</h2>
      </div>

      <div class="topbar-right">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Rechercher..." class="search-input">
        </div>

        <button mat-icon-button class="notif-btn">
          <span class="material-symbols-outlined">notifications</span>
          <span class="notif-badge badge-pulse">3</span>
        </button>

        <div class="user-menu">
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
            <div class="avatar">{{ getInitials() }}</div>
            <span class="user-name">{{ currentUser?.username }}</span>
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item disabled>
              <span class="material-symbols-outlined">person</span>
              <span>Profil</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <span class="material-symbols-outlined">logout</span>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1E293B;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F1F5F9;
      border-radius: 10px;
      padding: 8px 16px;
      transition: width 300ms ease;

      input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
        color: #1E293B;
        width: 200px;
        font-family: inherit;

        &::placeholder { color: #94A3B8; }
      }

      .material-symbols-outlined { color: #94A3B8; font-size: 20px; }
    }

    .notif-btn {
      position: relative;

      .notif-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #EF4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1B2A4A, #2E4568);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #1E293B;
    }
  `]
})
export class TopbarComponent {
  currentUser: any;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.currentUser?.username || '';
    if (hour < 12) return `Bonjour, ${name} 👋`;
    if (hour < 18) return `Bon après-midi, ${name} 👋`;
    return `Bonsoir, ${name} 👋`;
  }

  getInitials(): string {
    const name = this.currentUser?.username || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

