import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>👑 Admin Panel</h2>
        </div>

        <nav class="menu">
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            📊 Dashboard
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            👥 Utilisateurs
          </a>
          <a routerLink="/admin/bets" routerLinkActive="active">
            🎯 Superviser Paris
          </a>
          <a routerLink="/admin/matches" routerLinkActive="active">
            ⚔️ Matchs
          </a>
          <a routerLink="/admin/teams" routerLinkActive="active">
            🏆 Équipes
          </a>
          <a routerLink="/admin/tournaments" routerLinkActive="active">
            🏅 Tournois
          </a>
          <a routerLink="/admin/transactions" routerLinkActive="active">
            💰 Transactions
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="btn-logout">🚪 Déconnexion</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        min-height: 100vh;
      }

      .sidebar {
        width: 250px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        flex-direction: column;
      }

      .sidebar-header {
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sidebar-header h2 {
        margin: 0;
        font-size: 20px;
      }

      .menu {
        flex: 1;
        padding: 16px 0;
        display: flex;
        flex-direction: column;
      }

      .menu a {
        padding: 16px 24px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.2s;
        border-left: 4px solid transparent;
      }

      .menu a:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .menu a.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-left-color: white;
      }

      .sidebar-footer {
        padding: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-logout {
        width: 100%;
        padding: 12px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .content {
        flex: 1;
        background: #f5f5f5;
        overflow-y: auto;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
