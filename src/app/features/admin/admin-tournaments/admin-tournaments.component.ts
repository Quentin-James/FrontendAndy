import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TournamentService } from '../../../core/services/tournament.service';
import { Tournament } from '../../../core/models/tournament.model';

@Component({
  selector: 'app-admin-tournaments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <h1>🏅 Gestion des Tournois</h1>

      <!-- Formulaire de création -->
      <div class="form-card">
        <h2>{{ editMode ? 'Modifier' : 'Créer' }} un tournoi</h2>
        <form [formGroup]="tournamentForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nom du tournoi *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Worlds 2024"
              />
            </div>

            <div class="form-group">
              <label>Jeu *</label>
              <input
                type="text"
                formControlName="game"
                placeholder="League of Legends"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prize Pool * (€)</label>
              <input
                type="number"
                formControlName="prize_pool"
                placeholder="2000000"
                min="0"
                step="1000"
              />
            </div>

            <div class="form-group">
              <label>URL du logo</label>
              <input
                type="url"
                formControlName="logo_url"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de début *</label>
              <input type="date" formControlName="start_date" />
            </div>

            <div class="form-group">
              <label>Date de fin *</label>
              <input type="date" formControlName="end_date" />
            </div>
          </div>

          @if (tournamentForm.get('logo_url')?.value) {
          <div class="preview">
            <img
              [src]="tournamentForm.get('logo_url')?.value"
              alt="Preview"
              (error)="onImageError($event)"
            />
          </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="tournamentForm.invalid || loading"
            >
              {{ loading ? 'Chargement...' : editMode ? 'Modifier' : 'Créer' }}
            </button>
            @if (editMode) {
            <button type="button" class="btn-secondary" (click)="cancelEdit()">
              Annuler
            </button>
            }
          </div>
        </form>
      </div>

      <!-- Table des tournois -->
      <div class="table-card">
        <h2>Liste des tournois ({{ tournaments().length }})</h2>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nom</th>
                <th>Jeu</th>
                <th>Prize Pool</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tournament of tournaments(); track tournament.id) {
              <tr>
                <td>
                  <img
                    [src]="tournament.logo_url"
                    [alt]="tournament.name"
                    class="tournament-logo"
                    (error)="onImageError($event)"
                  />
                </td>
                <td>
                  <strong>{{ tournament.name }}</strong>
                </td>
                <td>
                  <span class="game-badge">{{ tournament.game }}</span>
                </td>
                <td class="prize-pool">
                  {{ tournament.prize_pool | number }}€
                </td>
                <td>
                  <div class="dates">
                    <small
                      >📅
                      {{ tournament.start_date | date : 'dd/MM/yyyy' }}</small
                    >
                    <small
                      >🏁 {{ tournament.end_date | date : 'dd/MM/yyyy' }}</small
                    >
                  </div>
                </td>
                <td>
                  <button
                    class="btn-icon"
                    (click)="editTournament(tournament)"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon danger"
                    (click)="deleteTournament(tournament)"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              } @empty {
              <tr>
                <td colspan="6" class="no-data">Aucun tournoi trouvé</td>
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
        grid-template-columns: 1fr 1fr;
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

      .form-group input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
      }

      .preview {
        margin: 16px 0;
        text-align: center;
      }

      .preview img {
        max-width: 200px;
        max-height: 200px;
        object-fit: contain;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 8px;
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
      }

      .tournament-logo {
        width: 60px;
        height: 60px;
        object-fit: contain;
      }

      .game-badge {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .prize-pool {
        font-weight: 600;
        color: #4caf50;
        font-size: 16px;
      }

      .dates {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .dates small {
        color: #666;
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

      .no-data {
        text-align: center;
        color: #999;
        padding: 40px !important;
      }
    `,
  ],
})
export class AdminTournamentsComponent implements OnInit {
  tournamentForm: FormGroup;
  tournaments = signal<Tournament[]>([]);
  loading = false;
  editMode = false;
  currentTournamentId?: number;

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      game: ['', Validators.required],
      prize_pool: [0, [Validators.required, Validators.min(0)]],
      logo_url: [''],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    console.log('📡 Loading tournaments...');
    this.tournamentService.getAllTournaments().subscribe({
      next: (tournaments) => {
        console.log('✅ Tournaments loaded:', tournaments);
        this.tournaments.set(tournaments);
      },
      error: (error) => {
        console.error('❌ Error loading tournaments:', error);
        alert('Erreur lors du chargement des tournois');
      },
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://via.placeholder.com/150/667eea/FFFFFF?text=Tournament';
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      this.loading = true;
      console.log('='.repeat(50));
      console.log('📝 TOURNAMENT FORM SUBMISSION');
      console.log('='.repeat(50));
      console.log('Raw form values:', this.tournamentForm.value);
      console.log('Edit mode:', this.editMode);

      // S'assurer que prize_pool est un nombre
      const prizePool = Number(this.tournamentForm.value.prize_pool);
      console.log('Prize pool conversion:', {
        original: this.tournamentForm.value.prize_pool,
        type: typeof this.tournamentForm.value.prize_pool,
        converted: prizePool,
        typeAfter: typeof prizePool,
      });

      const data = {
        name: this.tournamentForm.value.name,
        game: this.tournamentForm.value.game,
        prize_pool: prizePool, // Nombre, pas string
        logo_url:
          this.tournamentForm.value.logo_url ||
          'https://via.placeholder.com/150/667eea/FFFFFF?text=Tournament',
        start_date: this.tournamentForm.value.start_date,
        end_date: this.tournamentForm.value.end_date,
      };

      console.log('📤 Final data to send:');
      console.log(JSON.stringify(data, null, 2));
      console.log('Data types:', {
        name: typeof data.name,
        game: typeof data.game,
        prize_pool: typeof data.prize_pool,
        logo_url: typeof data.logo_url,
        start_date: typeof data.start_date,
        end_date: typeof data.end_date,
      });
      console.log('🔐 Token exists:', !!localStorage.getItem('access_token'));
      console.log('🌐 API endpoint:', 'http://localhost:3000/tournaments');

      if (this.editMode && this.currentTournamentId) {
        console.log('🔄 UPDATE MODE - ID:', this.currentTournamentId);

        this.tournamentService
          .updateTournament(this.currentTournamentId, data)
          .subscribe({
            next: (response) => {
              console.log('✅ UPDATE SUCCESS:', response);
              alert('✅ Tournoi modifié !');
              this.loadTournaments();
              this.resetForm();
            },
            error: (error) => {
              console.error('❌ UPDATE ERROR:', error);
              console.error('Status:', error.status);
              console.error('Message:', error.message);
              console.error('Body:', error.error);
              alert(
                `Erreur: ${
                  error.error?.message || 'Impossible de modifier le tournoi'
                }`
              );
              this.loading = false;
            },
            complete: () => (this.loading = false),
          });
      } else {
        console.log('➕ CREATE MODE');

        this.tournamentService.createTournament(data).subscribe({
          next: (response) => {
            console.log('✅ CREATE SUCCESS:', response);
            alert('✅ Tournoi créé avec succès !');
            this.loadTournaments();
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ CREATE ERROR');
            console.error('Status:', error.status);
            console.error('Status text:', error.statusText);
            console.error('Message:', error.message);
            console.error('Error body:', error.error);
            console.error('Full error:', JSON.stringify(error, null, 2));

            let errorMsg = 'Impossible de créer le tournoi';

            if (error.status === 0) {
              errorMsg =
                '❌ Erreur de connexion. Vérifiez que le backend est démarré sur http://localhost:3000';
            } else if (error.status === 400) {
              errorMsg = `❌ Erreur de validation: ${JSON.stringify(
                error.error
              )}`;
            } else if (error.status === 401) {
              errorMsg =
                '❌ Non authentifié. Token invalide ou expiré. Reconnectez-vous.';
            } else if (error.status === 403) {
              errorMsg =
                "❌ Accès refusé. Vous n'avez pas les droits administrateur.";
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMsg = error.error;
            }

            alert(`Erreur: ${errorMsg}`);
            this.loading = false;
          },
          complete: () => (this.loading = false),
        });
      }
    } else {
      console.log('❌ FORM INVALID');
      console.log('Form errors:');
      Object.keys(this.tournamentForm.controls).forEach((key) => {
        const control = this.tournamentForm.get(key);
        if (control?.invalid) {
          console.log(`  ❌ ${key}:`, control.errors);
        }
      });
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  editTournament(tournament: Tournament): void {
    console.log('✏️ Editing tournament:', tournament);
    this.editMode = true;
    this.currentTournamentId = tournament.id;
    this.tournamentForm.patchValue({
      name: tournament.name,
      game: tournament.game,
      prize_pool: tournament.prize_pool,
      logo_url: tournament.logo_url,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTournament(tournament: Tournament): void {
    if (
      confirm(
        `⚠️ Supprimer ${tournament.name} ?\n\nCette action est irréversible !`
      )
    ) {
      console.log('🗑️ Deleting tournament:', tournament.id);
      this.tournamentService.deleteTournament(tournament.id).subscribe({
        next: () => {
          alert('✅ Tournoi supprimé !');
          this.loadTournaments();
        },
        error: (error) => {
          console.error('❌ Error deleting:', error);
          if (error.status === 409) {
            alert(
              '❌ Impossible de supprimer ce tournoi car des matchs y sont associés.'
            );
          } else {
            alert(
              `Erreur: ${
                error.error?.message || 'Impossible de supprimer le tournoi'
              }`
            );
          }
        },
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.tournamentForm.reset({ prize_pool: 0 });
    this.editMode = false;
    this.currentTournamentId = undefined;
  }
}
