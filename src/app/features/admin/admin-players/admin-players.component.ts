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
  templateUrl: './admin-players.component.html',
  styleUrls: ['./admin-players.component.css'],
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
