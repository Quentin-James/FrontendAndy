import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PlayerService } from '../../../core/services/player.service';
import { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-admin-players',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <h1>👤 Gestion des Joueurs</h1>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <h3>{{ players().length }}</h3>
            <p>Total Joueurs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌍</div>
          <div class="stat-content">
            <h3>{{ getUniqueNationalities() }}</h3>
            <p>Nationalités</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-content">
            <h3>{{ getUniquePositions() }}</h3>
            <p>Positions</p>
          </div>
        </div>
      </div>

      <!-- Formulaire de création -->
      <div class="form-card">
        <h2>{{ editMode ? 'Modifier' : 'Créer' }} un joueur</h2>
        <form [formGroup]="playerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nom complet *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Lee Sang-hyeok"
              />
            </div>

            <div class="form-group">
              <label>Game Tag *</label>
              <input
                type="text"
                formControlName="game_tag"
                placeholder="T1 Faker"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Position *</label>
              <select formControlName="position">
                <option value="">-- Sélectionner --</option>
                <option value="Top">Top</option>
                <option value="Jungle">Jungle</option>
                <option value="Mid">Mid</option>
                <option value="ADC">ADC</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div class="form-group">
              <label>Date de naissance *</label>
              <input type="date" formControlName="birth_date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nationalité *</label>
              <input
                type="text"
                formControlName="nationality"
                placeholder="South Korea"
              />
            </div>

            <div class="form-group">
              <label>URL Avatar</label>
              <input
                type="url"
                formControlName="avatar_url"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          @if (playerForm.get('avatar_url')?.value) {
          <div class="preview">
            <img
              [src]="playerForm.get('avatar_url')?.value"
              alt="Preview"
              (error)="onImageError($event)"
            />
          </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="playerForm.invalid || loading"
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

      <!-- Table des joueurs -->
      <div class="table-card">
        <h2>Liste des joueurs ({{ players().length }})</h2>

        <!-- Filtres -->
        <div class="filters">
          <input
            type="text"
            placeholder="🔍 Rechercher un joueur..."
            (input)="onSearch($event)"
            class="search-input"
          />
          <select (change)="onFilterPosition($event)" class="filter-select">
            <option value="">Toutes les positions</option>
            <option value="Top">Top</option>
            <option value="Jungle">Jungle</option>
            <option value="Mid">Mid</option>
            <option value="ADC">ADC</option>
            <option value="Support">Support</option>
          </select>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Game Tag</th>
                <th>Position</th>
                <th>Date de naissance</th>
                <th>Nationalité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (player of filteredPlayers(); track player.id) {
              <tr>
                <td>
                  <img
                    [src]="player.avatar_url"
                    [alt]="player.name"
                    class="player-avatar"
                    (error)="onImageError($event)"
                  />
                </td>
                <td>
                  <strong>{{ player.name }}</strong>
                </td>
                <td>
                  <span class="game-tag">{{ player.game_tag }}</span>
                </td>
                <td>
                  <span
                    [class]="'position-badge ' + player.position.toLowerCase()"
                  >
                    {{ player.position }}
                  </span>
                </td>
                <td>{{ player.birth_date | date : 'dd/MM/yyyy' }}</td>
                <td>
                  <span class="nationality">{{ player.nationality }}</span>
                </td>
                <td>
                  <button
                    class="btn-icon"
                    (click)="editPlayer(player)"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon danger"
                    (click)="deletePlayer(player)"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              } @empty {
              <tr>
                <td colspan="7" class="no-data">Aucun joueur trouvé</td>
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

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
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

      .preview {
        margin: 16px 0;
        text-align: center;
      }

      .preview img {
        max-width: 150px;
        max-height: 150px;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid #667eea;
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

      .filters {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
      }

      .search-input,
      .filter-select {
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .search-input {
        flex: 1;
      }

      .filter-select {
        min-width: 200px;
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

      .player-avatar {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 50%;
        border: 2px solid #667eea;
      }

      .game-tag {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .position-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .position-badge.top {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .position-badge.jungle {
        background: #fff3e0;
        color: #e65100;
      }

      .position-badge.mid {
        background: #e1f5fe;
        color: #0277bd;
      }

      .position-badge.adc {
        background: #fce4ec;
        color: #c2185b;
      }

      .position-badge.support {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .nationality {
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
export class AdminPlayersComponent implements OnInit {
  playerForm: FormGroup;
  players = signal<Player[]>([]);
  filteredPlayers = signal<Player[]>([]);
  loading = false;
  editMode = false;
  currentPlayerId?: number;

  constructor(private fb: FormBuilder, private playerService: PlayerService) {
    this.playerForm = this.fb.group({
      name: ['', Validators.required],
      game_tag: ['', Validators.required],
      position: ['', Validators.required],
      birth_date: ['', Validators.required],
      nationality: ['', Validators.required],
      avatar_url: [''],
    });
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    console.log('📡 Loading players...');
    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        console.log('✅ Players loaded:', players);
        this.players.set(players);
        this.filteredPlayers.set(players);
      },
      error: (error) => {
        console.error('❌ Error loading players:', error);
        alert('Erreur lors du chargement des joueurs');
      },
    });
  }

  getUniqueNationalities(): number {
    const nationalities = new Set(this.players().map((p) => p.nationality));
    return nationalities.size;
  }

  getUniquePositions(): number {
    const positions = new Set(this.players().map((p) => p.position));
    return positions.size;
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    if (!query) {
      this.filteredPlayers.set(this.players());
      return;
    }

    const filtered = this.players().filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        player.game_tag.toLowerCase().includes(query) ||
        player.nationality.toLowerCase().includes(query)
    );
    this.filteredPlayers.set(filtered);
  }

  onFilterPosition(event: Event): void {
    const position = (event.target as HTMLSelectElement).value;
    if (!position) {
      this.filteredPlayers.set(this.players());
      return;
    }

    const filtered = this.players().filter(
      (player) => player.position === position
    );
    this.filteredPlayers.set(filtered);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://via.placeholder.com/150/667eea/FFFFFF?text=Player';
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.loading = true;
      console.log('📝 Form submitted:', this.playerForm.value);

      const data = {
        ...this.playerForm.value,
        avatar_url:
          this.playerForm.value.avatar_url ||
          'https://via.placeholder.com/150/667eea/FFFFFF?text=Player',
      };

      if (this.editMode && this.currentPlayerId) {
        console.log('🔄 Updating player:', this.currentPlayerId);

        this.playerService.updatePlayer(this.currentPlayerId, data).subscribe({
          next: () => {
            alert('✅ Joueur modifié !');
            this.loadPlayers();
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ Error:', error);
            alert(
              `Erreur: ${
                error.error?.message || 'Impossible de modifier le joueur'
              }`
            );
            this.loading = false;
          },
          complete: () => (this.loading = false),
        });
      } else {
        console.log('➕ Creating player');

        this.playerService.createPlayer(data).subscribe({
          next: () => {
            alert('✅ Joueur créé !');
            this.loadPlayers();
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ Error:', error);
            alert(
              `Erreur: ${
                error.error?.message || 'Impossible de créer le joueur'
              }`
            );
            this.loading = false;
          },
          complete: () => (this.loading = false),
        });
      }
    } else {
      console.log('❌ Form invalid');
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  editPlayer(player: Player): void {
    console.log('✏️ Editing player:', player);
    this.editMode = true;
    this.currentPlayerId = player.id;
    this.playerForm.patchValue({
      name: player.name,
      game_tag: player.game_tag,
      position: player.position,
      birth_date: player.birth_date,
      nationality: player.nationality,
      avatar_url: player.avatar_url,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deletePlayer(player: Player): void {
    if (
      confirm(
        `⚠️ Supprimer ${player.name} ?\n\nAttention: Si le joueur est assigné à une équipe, la suppression échouera.\n\nCette action est irréversible !`
      )
    ) {
      console.log('🗑️ Deleting player:', player.id);
      this.playerService.deletePlayer(player.id).subscribe({
        next: () => {
          alert('✅ Joueur supprimé !');
          this.loadPlayers();
        },
        error: (error) => {
          console.error('❌ Error deleting:', error);
          if (error.status === 409) {
            alert(
              "❌ Impossible de supprimer ce joueur car il est assigné à une ou plusieurs équipes. Retirez-le d'abord de toutes les équipes."
            );
          } else {
            alert(
              `Erreur: ${
                error.error?.message || 'Impossible de supprimer le joueur'
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
    this.playerForm.reset();
    this.editMode = false;
    this.currentPlayerId = undefined;
  }
}
