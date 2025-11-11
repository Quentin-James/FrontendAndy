import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { MatchService } from '../../../core/services/match.service';
import { BetService } from '../../../core/services/bet.service';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <h1>📊 Tableau de Bord Admin</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ totalUsers() }}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚔️</div>
          <div class="stat-content">
            <h3>{{ totalMatches() }}</h3>
            <p>Matchs</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>{{ totalBets() }}</h3>
            <p>Paris actifs</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3>{{ totalTeams() }}</h3>
            <p>Équipes</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>🚀 Actions Rapides</h2>
        <div class="actions-grid">
          <a routerLink="/admin/users" class="action-card users">
            <span class="action-icon">👥</span>
            <h3>Gérer les Utilisateurs</h3>
            <p>Créer, modifier, supprimer des comptes</p>
            <span class="action-badge">{{ totalUsers() }}</span>
          </a>

          <a routerLink="/admin/teams" class="action-card teams">
            <span class="action-icon">🏆</span>
            <h3>Gérer les Équipes</h3>
            <p>Créer et gérer les équipes e-sport</p>
            <span class="action-badge">{{ totalTeams() }}</span>
          </a>

          <a routerLink="/admin/matches" class="action-card matches">
            <span class="action-icon">⚔️</span>
            <h3>Gérer les Matchs</h3>
            <p>Planifier et gérer les matchs</p>
            <span class="action-badge">{{ totalMatches() }}</span>
          </a>

          <a routerLink="/admin/players" class="action-card players">
            <span class="action-icon">👤</span>
            <h3>Gérer les Joueurs</h3>
            <p>Ajouter et gérer les joueurs</p>
          </a>

          <a routerLink="/admin/tournaments" class="action-card tournaments">
            <span class="action-icon">🏅</span>
            <h3>Gérer les Tournois</h3>
            <p>Créer et gérer les tournois</p>
          </a>

          <a routerLink="/admin/bets" class="action-card bets">
            <span class="action-icon">🎯</span>
            <h3>Superviser les Paris</h3>
            <p>Voir tous les paris en cours</p>
            <span class="action-badge">{{ totalBets() }}</span>
          </a>
        </div>
      </div>

      <!-- Alertes admin -->
      <div class="alerts-section">
        <h2>⚠️ Alertes & Notifications</h2>
        <div class="alert info">
          <strong>ℹ️ Info:</strong> Système opérationnel
        </div>
        <div class="alert warning">
          <strong>⚠️ Attention:</strong> {{ totalBets() }} paris en attente de
          résolution
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .stat-icon {
        font-size: 48px;
      }

      .stat-content h3 {
        font-size: 32px;
        margin: 0;
        color: #667eea;
      }

      .stat-content p {
        margin: 5px 0 0 0;
        color: #666;
      }

      .quick-actions h2 {
        margin-bottom: 20px;
        color: #333;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .action-card {
        position: relative;
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .action-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .action-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 16px;
      }

      .action-card h3 {
        margin: 0 0 8px 0;
        color: #667eea;
      }

      .action-card p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .action-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #f44336;
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      }

      .action-card.users {
        border-left: 4px solid #2196f3;
      }
      .action-card.teams {
        border-left: 4px solid #ff9800;
      }
      .action-card.matches {
        border-left: 4px solid #f44336;
      }
      .action-card.players {
        border-left: 4px solid #9c27b0;
      }
      .action-card.tournaments {
        border-left: 4px solid #4caf50;
      }
      .action-card.bets {
        border-left: 4px solid #00bcd4;
      }

      .alerts-section {
        margin-top: 40px;
      }

      .alert {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .alert.info {
        background: #e3f2fd;
        border-left: 4px solid #2196f3;
      }

      .alert.warning {
        background: #fff3e0;
        border-left: 4px solid #ff9800;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = signal(0);
  totalMatches = signal(0);
  totalBets = signal(0);
  totalTeams = signal(0);

  constructor(
    private userService: UserService,
    private matchService: MatchService,
    private betService: BetService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    console.log('📊 Admin Dashboard initialized');
    console.log('🔍 Checking routerLink="/admin/bets"');
    this.loadStats();
  }

  loadStats(): void {
    this.userService
      .getAllUsers()
      .subscribe((users) => this.totalUsers.set(users.length));

    this.matchService
      .getAllMatches()
      .subscribe((matches) => this.totalMatches.set(matches.length));

    const betServiceAny = this.betService as any;
    if (typeof betServiceAny.getAllBets === 'function') {
      betServiceAny
        .getAllBets()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else if (typeof betServiceAny.getBets === 'function') {
      betServiceAny
        .getBets()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else if (typeof betServiceAny.getAll === 'function') {
      betServiceAny
        .getAll()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else {
      // No compatible method found on BetService; default to 0
      this.totalBets.set(0);
    }

    this.teamService
      .getAllTeams()
      .subscribe((teams) => this.totalTeams.set(teams.length));
  }
}
