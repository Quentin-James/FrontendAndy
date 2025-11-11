import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <a routerLink="/">
            <span class="logo">🎮</span>
            <span class="brand-name">E-Sport Betting</span>
          </a>
        </div>

        <div class="nav-menu" [class.active]="menuOpen">
          <a
            routerLink="/matches"
            routerLinkActive="active"
            (click)="closeMenu()"
          >
            ⚔️ Matchs
          </a>

          @if (isAuthenticated()) {
          <a
            routerLink="/profile"
            routerLinkActive="active"
            (click)="closeMenu()"
          >
            💼 Mon Profil
          </a>
          <a
            routerLink="/bets/my-bets"
            routerLinkActive="active"
            (click)="closeMenu()"
          >
            🎯 Mes Paris
          </a>
          } @if (isAdmin) {
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="active"
            class="admin-link"
            (click)="closeMenu()"
          >
            👑 Admin Panel
          </a>
          <div class="nav-dropdown">
            <button class="dropdown-toggle">⚙️ Admin</button>
            <div class="dropdown-menu">
              <a routerLink="/admin/dashboard" (click)="closeMenu()"
                >📊 Dashboard</a
              >
              <a routerLink="/admin/users" (click)="closeMenu()"
                >👥 Utilisateurs</a
              >
              <a routerLink="/admin/teams" (click)="closeMenu()">🏆 Équipes</a>
              <a routerLink="/admin/matches" (click)="closeMenu()">⚔️ Matchs</a>
              <a routerLink="/admin/players" (click)="closeMenu()"
                >👤 Joueurs</a
              >
              <a routerLink="/admin/tournaments" (click)="closeMenu()"
                >🏅 Tournois</a
              >
            </div>
          </div>
          }
        </div>

        <div class="nav-actions">
          @if (isAuthenticated()) {
          <div class="user-info">
            <span class="balance">💰 {{ currentUser()?.balance }}€</span>
            <span class="username">{{ currentUser()?.username }}</span>
            <button class="btn-logout" (click)="logout()">
              🚪 Déconnexion
            </button>
          </div>
          } @else {
          <a routerLink="/login" class="btn-login">Se connecter</a>
          <a routerLink="/register" class="btn-register">S'inscrire</a>
          }
        </div>

        <button class="mobile-toggle" (click)="toggleMenu()">
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 70px;
      }

      .nav-brand a {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: white;
      }

      .logo {
        font-size: 32px;
      }

      .brand-name {
        font-size: 24px;
        font-weight: bold;
      }

      .nav-menu {
        display: flex;
        gap: 24px;
        align-items: center;
      }

      .nav-menu a {
        color: white;
        text-decoration: none;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background 0.2s;
      }

      .nav-menu a:hover,
      .nav-menu a.active {
        background: rgba(255, 255, 255, 0.2);
      }

      .nav-dropdown {
        position: relative;
      }

      .dropdown-toggle {
        color: white;
        background: none;
        border: none;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .dropdown-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        margin-top: 8px;
      }

      .nav-dropdown:hover .dropdown-menu {
        display: block;
      }

      .dropdown-menu a {
        display: block;
        color: #333;
        padding: 12px 20px;
        text-decoration: none;
        transition: background 0.2s;
      }

      .dropdown-menu a:hover {
        background: #f5f5f5;
      }

      .dropdown-menu a:first-child {
        border-radius: 8px 8px 0 0;
      }

      .dropdown-menu a:last-child {
        border-radius: 0 0 8px 8px;
      }

      .nav-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .user-info {
        display: flex;
        gap: 16px;
        align-items: center;
        color: white;
      }

      .balance {
        background: rgba(255, 255, 255, 0.2);
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
      }

      .username {
        font-weight: 600;
      }

      .btn-login,
      .btn-register,
      .btn-logout {
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
        border: none;
        font-size: 14px;
      }

      .btn-login {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .btn-login:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .btn-register {
        background: white;
        color: #667eea;
      }

      .btn-register:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .btn-logout {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .btn-logout:hover {
        background: #f44336;
      }

      .mobile-toggle {
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }

      .admin-link {
        background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
        padding: 8px 16px !important;
        border-radius: 8px;
        font-weight: 700;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
        }
      }

      @media (max-width: 768px) {
        .nav-menu {
          display: none;
          position: absolute;
          top: 70px;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          flex-direction: column;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-menu.active {
          display: flex;
        }

        .nav-actions {
          display: none;
        }

        .mobile-toggle {
          display: block;
        }

        .dropdown-menu {
          position: static;
          box-shadow: none;
          margin-top: 8px;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  menuOpen = false;

  // Utiliser des getters au lieu d'initialiser avant le constructeur
  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isAdmin() {
    return this.authService.isAdmin();
  }

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
