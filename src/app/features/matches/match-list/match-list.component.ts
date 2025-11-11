import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../../core/services/match.service';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="matches-container">
      <h1>⚔️ Matchs E-sport</h1>

      <div class="tabs">
        <button [class.active]="selectedTab() === 'scheduled'" (click)="selectTab('scheduled')">
          📅 À venir
        </button>
        <button [class.active]="selectedTab() === 'live'" (click)="selectTab('live')">
          🔴 En cours
        </button>
        <button [class.active]="selectedTab() === 'finished'" (click)="selectTab('finished')">
          ✅ Terminés
        </button>
      </div>

      <div class="matches-grid">
        @for (match of displayedMatches(); track match.id) {
        <div class="match-card" [class.live]="match.status === 'live'">
          <div class="match-header">
            <span class="tournament">{{ match.tournament?.name }}</span>
            <span [class]="'status-badge ' + match.status">{{ getStatusLabel(match.status) }}</span>
          </div>

          <div class="teams">
            <div class="team">
              <img [src]="match.team1?.logo_url" [alt]="match.team1?.name" />
              <h3>{{ match.team1?.name }}</h3>
              @if (match.score1 !== null) {
              <div class="score" [class.winner]="match.winner?.id === match.team1_id">
                {{ match.score1 }}
              </div>
              }
            </div>

            <div class="vs">VS</div>

            <div class="team">
              <img [src]="match.team2?.logo_url" [alt]="match.team2?.name" />
              <h3>{{ match.team2?.name }}</h3>
              @if (match.score2 !== null) {
              <div class="score" [class.winner]="match.winner?.id === match.team2_id">
                {{ match.score2 }}
              </div>
              }
            </div>
          </div>

          <div class="match-info">
            <p>📅 {{ match.scheduled_at | date : 'short' }}</p>
            <p>🎮 {{ match.format }}</p>
          </div>

          @if (match.status === 'scheduled') {
          <button class="btn-bet" [routerLink]="['/bets/place', match.id]">💰 Parier</button>
          } @else {
          <button class="btn-view" [routerLink]="['/matches', match.id]">👁️ Voir détails</button>
          }
        </div>
        } @if (displayedMatches().length === 0) {
        <div class="no-matches">
          <p>Aucun match {{ getStatusLabel(selectedTab()) }}</p>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .matches-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
        text-align: center;
      }

      .tabs {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 30px;
      }

      .tabs button {
        padding: 12px 24px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tabs button.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }

      .matches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
      }

      .match-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .match-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .match-card.live {
        border: 2px solid #f44336;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
        }
      }

      .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .tournament {
        font-size: 14px;
        color: #666;
        font-weight: 600;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-badge.scheduled {
        background: #2196f3;
        color: white;
      }

      .status-badge.live {
        background: #f44336;
        color: white;
      }

      .status-badge.finished {
        background: #4caf50;
        color: white;
      }

      .teams {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin: 24px 0;
      }

      .team {
        text-align: center;
        flex: 1;
      }

      .team img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        margin-bottom: 8px;
      }

      .team h3 {
        margin: 8px 0;
        font-size: 16px;
        color: #333;
      }

      .score {
        font-size: 32px;
        font-weight: bold;
        color: #999;
        margin-top: 8px;
      }

      .score.winner {
        color: #4caf50;
      }

      .vs {
        font-size: 20px;
        font-weight: bold;
        color: #999;
        padding: 0 16px;
      }

      .match-info {
        margin: 16px 0;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .match-info p {
        margin: 4px 0;
        font-size: 14px;
        color: #666;
      }

      .btn-bet,
      .btn-view {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-bet {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
      }

      .btn-bet:hover {
        transform: translateY(-2px);
      }

      .btn-view {
        background: #667eea;
        color: white;
      }

      .no-matches {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #999;
        font-size: 18px;
      }
    `,
  ],
})
export class MatchListComponent implements OnInit {
  selectedTab = signal<'scheduled' | 'live' | 'finished'>('scheduled');
  allMatches = signal<Match[]>([]);
  displayedMatches = signal<Match[]>([]);

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.matchService.getAllMatches().subscribe((matches) => {
      this.allMatches.set(matches);
      this.filterMatches();
    });
  }

  selectTab(status: 'scheduled' | 'live' | 'finished'): void {
    this.selectedTab.set(status);
    this.filterMatches();
  }

  filterMatches(): void {
    const filtered = this.allMatches().filter((m) => m.status === this.selectedTab());
    this.displayedMatches.set(filtered);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Programmé',
      live: 'En cours',
      finished: 'Terminé',
    };
    return labels[status] || status;
  }
}
