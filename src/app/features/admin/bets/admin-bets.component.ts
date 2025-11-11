import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../../core/services/bet.service';
import { Bet } from '../../../core/models/bet.model';

@Component({
  selector: 'app-admin-bets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-bets-container">
      <div class="header">
        <h1>🎯 Supervision des Paris (Admin)</h1>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ bets().length }}</span>
          </div>
          <div class="stat-card pending">
            <span class="stat-label">En attente</span>
            <span class="stat-value">{{ countByStatus('pending') }}</span>
          </div>
          <div class="stat-card success">
            <span class="stat-label">Gagnés</span>
            <span class="stat-value">{{ countByStatus('won') }}</span>
          </div>
          <div class="stat-card danger">
            <span class="stat-label">Perdus</span>
            <span class="stat-value">{{ countByStatus('lost') }}</span>
          </div>
        </div>
      </div>

      @if (loading()) {
      <div class="loading">Chargement des paris...</div>
      } @else if (error()) {
      <div class="error-message">
        <p>❌ {{ error() }}</p>
        <button (click)="loadBets()" class="btn-retry">Réessayer</button>
      </div>
      } @else if (bets().length === 0) {
      <div class="no-data">
        <p>Aucun pari pour le moment</p>
      </div>
      } @else {
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Match</th>
              <th>Équipe</th>
              <th>Mise</th>
              <th>Cote</th>
              <th>Gain potentiel</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (bet of bets(); track bet.id) {
            <tr [class]="bet.status">
              <td>#{{ bet.id }}</td>
              <td>
                <div class="user-info">
                  <span class="username">{{
                    bet.user?.username || 'User #' + bet.user_id
                  }}</span>
                  <span class="user-id">ID: {{ bet.user_id }}</span>
                </div>
              </td>
              <td>
                <div class="match-info">
                  <span>{{ bet.match?.team1?.name || 'Team 1' }}</span>
                  <span class="vs">vs</span>
                  <span>{{ bet.match?.team2?.name || 'Team 2' }}</span>
                </div>
              </td>
              <td>
                <span class="team-bet">{{
                  bet.team?.name || 'Team #' + bet.team_id
                }}</span>
              </td>
              <td class="amount">{{ bet.amount }}€</td>
              <td class="odds">{{ bet.odds }}</td>
              <td class="potential-win">
                {{
                  bet.potential_win ||
                    (parseFloat(bet.amount) * parseFloat(bet.odds)).toFixed(2)
                }}€
              </td>
              <td>
                <span [class]="'status-badge ' + bet.status">
                  {{ getStatusLabel(bet.status) }}
                </span>
              </td>
              <td class="date">{{ bet.created_at | date : 'short' }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-bets-container {
        padding: 24px;
      }

      .header {
        margin-bottom: 30px;
      }

      h1 {
        margin-bottom: 20px;
        color: #333;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .stat-card.pending {
        border-left: 4px solid #2196f3;
      }

      .stat-card.success {
        border-left: 4px solid #4caf50;
      }

      .stat-card.danger {
        border-left: 4px solid #f44336;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
      }

      .loading,
      .no-data {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
        color: #999;
      }

      .error-message {
        text-align: center;
        padding: 40px 20px;
        background: #ffebee;
        border-radius: 12px;
        color: #c62828;
      }

      .btn-retry {
        margin-top: 16px;
        padding: 12px 24px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }

      .table-container {
        background: white;
        border-radius: 12px;
        overflow-x: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f5f5f5;
        font-weight: 600;
        color: #333;
      }

      tr:hover {
        background: #f8f9ff;
      }

      tr.pending {
        background: #e3f2fd;
      }

      tr.won {
        background: #e8f5e9;
      }

      tr.lost {
        background: #ffebee;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .username {
        font-weight: 600;
        color: #333;
      }

      .user-id {
        font-size: 12px;
        color: #999;
      }

      .match-info {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .vs {
        color: #999;
        font-size: 12px;
      }

      .team-bet {
        font-weight: 600;
        color: #667eea;
      }

      .amount,
      .potential-win {
        font-weight: 600;
        color: #4caf50;
      }

      .odds {
        font-weight: 600;
        color: #ff9800;
      }

      .status-badge {
        padding: 6px 12px;
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
    `,
  ],
})
export class AdminBetsComponent implements OnInit {
  bets = signal<Bet[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private betService: BetService) {}

  ngOnInit(): void {
    console.log('🏠 AdminBets component initialized');
    console.log('📍 Current route: /admin/bets');
    this.loadBets();
  }

  loadBets(): void {
    this.loading.set(true);
    this.error.set(null);
    console.log('📡 Loading ALL bets (admin view)...');

    this.betService.getAllBets().subscribe({
      next: (bets) => {
        console.log('✅ All bets loaded:', bets);
        console.log('📊 Total bets:', bets.length);
        this.bets.set(bets);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading bets:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.error?.message);

        let errorMsg = 'Erreur lors du chargement des paris';

        if (error.status === 401) {
          errorMsg =
            "Non autorisé. Veuillez vous reconnecter en tant qu'admin.";
        } else if (error.status === 404) {
          errorMsg = 'Endpoint GET /bets non disponible';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        this.error.set(errorMsg);
        this.loading.set(false);
      },
    });
  }

  countByStatus(status: string): number {
    return this.bets().filter((bet) => bet.status === status).length;
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

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
