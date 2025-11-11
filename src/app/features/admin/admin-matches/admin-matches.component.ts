import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatchService } from '../../../core/services/match.service';
import { TeamService } from '../../../core/services/team.service';
import { TournamentService } from '../../../core/services/tournament.service';
import { Match } from '../../../core/models/match.model';
import { Team } from '../../../core/models/team.model';
import { Tournament } from '../../../core/models/tournament.model';

@Component({
  selector: 'app-admin-matches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <h1>⚔️ Gestion des Matchs</h1>

      <div class="form-card">
        <h2>{{ editMode ? 'Modifier' : 'Créer' }} un match</h2>
        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Tournoi *</label>
            <select formControlName="tournament_id">
              <option value="">Sélectionner un tournoi</option>
              @for (tournament of tournaments(); track tournament.id) {
              <option [value]="tournament.id">{{ tournament.name }}</option>
              }
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Équipe 1 *</label>
              <select formControlName="team1_id">
                <option value="">Sélectionner</option>
                @for (team of teams(); track team.id) {
                <option [value]="team.id">{{ team.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Équipe 2 *</label>
              <select formControlName="team2_id">
                <option value="">Sélectionner</option>
                @for (team of teams(); track team.id) {
                <option [value]="team.id">{{ team.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date et heure *</label>
              <input type="datetime-local" formControlName="scheduled_at" />
            </div>

            <div class="form-group">
              <label>Format *</label>
              <select formControlName="format">
                <option value="Bo1">Bo1 (Best of 1)</option>
                <option value="Bo3">Bo3 (Best of 3)</option>
                <option value="Bo5">Bo5 (Best of 5)</option>
              </select>
            </div>
          </div>

          @if (editMode) {
          <div class="form-row">
            <div class="form-group">
              <label>Statut</label>
              <select formControlName="status">
                <option value="scheduled">Programmé</option>
                <option value="live">En cours</option>
                <option value="finished">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div class="form-group">
              <label>Score Team 1</label>
              <input type="number" formControlName="score1" min="0" />
            </div>

            <div class="form-group">
              <label>Score Team 2</label>
              <input type="number" formControlName="score2" min="0" />
            </div>
          </div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="matchForm.invalid || loading">
              {{ loading ? 'Chargement...' : editMode ? 'Modifier' : 'Créer' }}
            </button>
            @if (editMode) {
            <button type="button" class="btn-secondary" (click)="cancelEdit()">Annuler</button>
            }
          </div>
        </form>
      </div>

      <div class="table-card">
        <h2>Liste des matchs ({{ matches().length }})</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tournoi</th>
                <th>Match</th>
                <th>Date</th>
                <th>Format</th>
                <th>Score</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (match of matches(); track match.id) {
              <tr>
                <td>{{ match.tournament?.name }}</td>
                <td>
                  <div class="match-teams">
                    <span>{{ match.team1?.name }}</span>
                    <span class="vs">VS</span>
                    <span>{{ match.team2?.name }}</span>
                  </div>
                </td>
                <td>{{ match.scheduled_at | date : 'short' }}</td>
                <td>
                  <span class="format-badge">{{ match.format }}</span>
                </td>
                <td>
                  @if (match.score1 !== null && match.score2 !== null) {
                  <span class="score">{{ match.score1 }} - {{ match.score2 }}</span>
                  } @else {
                  <span class="no-score">-</span>
                  }
                </td>
                <td>
                  <span [class]="'status-badge ' + match.status">{{ match.status }}</span>
                </td>
                <td>
                  <button class="btn-icon" (click)="editMatch(match)">✏️</button>
                  <button class="btn-icon danger" (click)="deleteMatch(match)">🗑️</button>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
      }

      .form-card,
      .table-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .form-card h2,
      .table-card h2 {
        margin-top: 0;
        color: #667eea;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #667eea;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .table-responsive {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f5f5f5;
        font-weight: 600;
        color: #333;
      }

      .match-teams {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .match-teams .vs {
        color: #999;
        font-weight: 600;
      }

      .format-badge {
        background: #2196f3;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .score {
        font-weight: 600;
        font-size: 16px;
        color: #333;
      }

      .no-score {
        color: #999;
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

      .status-badge.cancelled {
        background: #9e9e9e;
        color: white;
      }

      .btn-icon {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        transition: transform 0.2s;
      }

      .btn-icon:hover {
        transform: scale(1.2);
      }
    `,
  ],
})
export class AdminMatchesComponent implements OnInit {
  matchForm: FormGroup;
  matches = signal<Match[]>([]);
  teams = signal<Team[]>([]);
  tournaments = signal<Tournament[]>([]);
  loading = false;
  editMode = false;
  currentMatchId?: number;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private teamService: TeamService,
    private tournamentService: TournamentService
  ) {
    this.matchForm = this.fb.group({
      tournament_id: ['', Validators.required],
      team1_id: ['', Validators.required],
      team2_id: ['', Validators.required],
      scheduled_at: ['', Validators.required],
      format: ['Bo3', Validators.required],
      status: ['scheduled'],
      score1: [null],
      score2: [null],
    });
  }

  ngOnInit(): void {
    this.loadMatches();
    this.loadTeams();
    this.loadTournaments();
  }

  loadMatches(): void {
    this.matchService.getAllMatches().subscribe((matches) => this.matches.set(matches));
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe((teams) => this.teams.set(teams));
  }

  loadTournaments(): void {
    this.tournamentService
      .getAllTournaments()
      .subscribe((tournaments) => this.tournaments.set(tournaments));
  }

  onSubmit(): void {
    if (this.matchForm.valid) {
      this.loading = true;
      const data = this.matchForm.value;

      if (this.editMode && this.currentMatchId) {
        this.matchService.updateMatch(this.currentMatchId, data).subscribe({
          next: () => {
            alert('Match modifié !');
            this.loadMatches();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      } else {
        this.matchService.createMatch(data).subscribe({
          next: () => {
            alert('Match créé !');
            this.loadMatches();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      }
    }
  }

  editMatch(match: Match): void {
    this.editMode = true;
    this.currentMatchId = match.id;

    const scheduledAt = new Date(match.scheduled_at).toISOString().slice(0, 16);

    this.matchForm.patchValue({
      tournament_id: match.tournament_id,
      team1_id: match.team1_id,
      team2_id: match.team2_id,
      scheduled_at: scheduledAt,
      format: match.format,
      status: match.status,
      score1: match.score1,
      score2: match.score2,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteMatch(match: Match): void {
    if (confirm('Supprimer ce match ?')) {
      this.matchService.deleteMatch(match.id).subscribe({
        next: () => {
          alert('Match supprimé !');
          this.loadMatches();
        },
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.matchForm.reset({ format: 'Bo3', status: 'scheduled' });
    this.editMode = false;
    this.currentMatchId = undefined;
  }
}
