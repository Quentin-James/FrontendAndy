import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BetService } from '../../../core/services/bet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Bet } from '../../../core/models/bet.model';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bets-container">
      <h1>🎯 Mes Paris</h1>

      <div class="stats-bar">
        <div class="stat">
          <span class="label">Total</span>
          <span class="value">{{ bets().length }}</span>
        </div>
        <div class="stat">
          <span class="label">En attente</span>
          <span class="value pending">{{ countByStatus('pending') }}</span>
        </div>
        <div class="stat">
          <span class="label">Gagnés</span>
          <span class="value won">{{ countByStatus('won') }}</span>
        </div>
        <div class="stat">
          <span class="label">Perdus</span>
          <span class="value lost">{{ countByStatus('lost') }}</span>
        </div>
      </div>

      <div class="bets-list">
        @for (bet of bets(); track bet.id) {
        <div class="bet-card" [class]="bet.status">
          <div class="bet-header">
            <span [class]="'status-badge ' + bet.status">{{
              getStatusLabel(bet.status)
            }}</span>
            <span class="date">{{ bet.created_at | date : 'short' }}</span>
          </div>

          <div class="match-info">
            <div class="teams">
              <span>{{ bet.match?.team1?.name }}</span>
              <span class="vs">VS</span>
              <span>{{ bet.match?.team2?.name }}</span>
            </div>
            <p class="bet-team">
              Pari sur: <strong>{{ bet.team?.name }}</strong>
            </p>
          </div>

          <div class="bet-details">
            <div class="detail">
              <span class="label">Mise</span>
              <span class="value">{{ bet.amount }}€</span>
            </div>
            <div class="detail">
              <span class="label">Cote</span>
              <span class="value">{{ bet.odds }}</span>
            </div>
            <div class="detail">
              <span class="label">Gain potentiel</span>
              <span class="value potential">{{ bet.potential_win }}€</span>
            </div>
          </div>
        </div>
        } @empty {
        <div class="no-bets">
          <p>Vous n'avez pas encore placé de paris</p>
          <a routerLink="/matches" class="btn-primary">Voir les matchs</a>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .bets-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
        text-align: center;
      }

      .stats-bar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
      }

      .stat {
        background: white;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .stat .label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .stat .value {
        display: block;
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
      }

      .stat .value.pending {
        color: #2196f3;
      }

      .stat .value.won {
        color: #4caf50;
      }

      .stat .value.lost {
        color: #f44336;
      }

      .bets-list {
        display: grid;
        gap: 16px;
      }

      .bet-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #e0e0e0;
      }

      .bet-card.pending {
        border-left-color: #2196f3;
      }

      .bet-card.won {
        border-left-color: #4caf50;
      }

      .bet-card.lost {
        border-left-color: #f44336;
      }

      .bet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-badge.pending {
        background: #2196f3;
        color: white;
      }

      .status-badge.won {
        background: #4caf50;
        color: white;
      }

      .status-badge.lost {
        background: #f44336;
        color: white;
      }

      .date {
        color: #999;
        font-size: 14px;
      }

      .match-info {
        margin-bottom: 16px;
      }

      .teams {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .teams .vs {
        color: #999;
      }

      .bet-team {
        color: #666;
        margin: 0;
      }

      .bet-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .detail {
        text-align: center;
      }

      .detail .label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .detail .value {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      .detail .value.potential {
        color: #4caf50;
      }

      .actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
      }

      .btn-delete {
        padding: 8px 16px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-delete:hover {
        background: #d32f2f;
      }

      .no-bets {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
      }

      .no-bets p {
        font-size: 18px;
        color: #999;
        margin-bottom: 20px;
      }

      .btn-primary {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        transition: transform 0.2s;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
      }
    `,
  ],
})
export class MyBetsComponent implements OnInit {
  bets = signal<Bet[]>([]);

  constructor(
    private betService: BetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🏠 MyBets component initialized');
    this.loadBets();
  }

  loadBets(): void {
    console.log('📡 Loading my bets...');

    this.betService.getMyBets().subscribe({
      next: (bets) => {
        console.log('✅ Bets loaded:', bets);
        console.log('📊 Total bets:', bets.length);
        this.bets.set(bets);
      },
      error: (error) => {
        console.error('❌ Error loading bets:', error);
        alert('Erreur lors du chargement des paris');
      },
    });
  }

  countByStatus(status: string): number {
    return this.bets().filter((b) => b.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      won: 'Gagné',
      lost: 'Perdu',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }
}
