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
  templateUrl: './admin-tournaments.component.html',
  styleUrls: ['./admin-tournaments.component.css'],
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

  /**
   * Charge la liste de tous les tournois depuis l'API
   */
  loadTournaments(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (tournaments) => {
        this.tournaments.set(tournaments);
      },
      error: (error) => {
        alert('Erreur lors du chargement des tournois');
      },
    });
  }

  /**
   * Remplace l'image par un placeholder en cas d'erreur de chargement
   * @param event - Événement d'erreur de chargement d'image
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://via.placeholder.com/150/667eea/FFFFFF?text=Tournament';
  }

  /**
   * Soumet le formulaire pour créer ou modifier un tournoi
   */
  onSubmit(): void {
    if (this.tournamentForm.valid) {
      this.loading = true;

      const prizePool = Number(this.tournamentForm.value.prize_pool);

      const data = {
        name: this.tournamentForm.value.name,
        game: this.tournamentForm.value.game,
        prize_pool: prizePool,
        logo_url:
          this.tournamentForm.value.logo_url ||
          'https://via.placeholder.com/150/667eea/FFFFFF?text=Tournament',
        start_date: this.tournamentForm.value.start_date,
        end_date: this.tournamentForm.value.end_date,
      };

      if (this.editMode && this.currentTournamentId) {
        this.tournamentService
          .updateTournament(this.currentTournamentId, data)
          .subscribe({
            next: (response) => {
              alert('✅ Tournoi modifié !');
              this.loadTournaments();
              this.resetForm();
            },
            error: (error) => {
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
        this.tournamentService.createTournament(data).subscribe({
          next: (response) => {
            alert('✅ Tournoi créé avec succès !');
            this.loadTournaments();
            this.resetForm();
          },
          error: (error) => {
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
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  /**
   * Charge les données d'un tournoi dans le formulaire pour édition
   * @param tournament - Tournoi à modifier
   */
  editTournament(tournament: Tournament): void {
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

  /**
   * Supprime un tournoi après confirmation
   * @param tournament - Tournoi à supprimer
   */
  deleteTournament(tournament: Tournament): void {
    if (
      confirm(
        `⚠️ Supprimer ${tournament.name} ?\n\nCette action est irréversible !`
      )
    ) {
      this.tournamentService.deleteTournament(tournament.id).subscribe({
        next: () => {
          alert('✅ Tournoi supprimé !');
          this.loadTournaments();
        },
        error: (error) => {
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

  /**
   * Annule l'édition en cours et réinitialise le formulaire
   */
  cancelEdit(): void {
    this.resetForm();
  }

  /**
   * Réinitialise le formulaire avec les valeurs par défaut
   */
  resetForm(): void {
    this.tournamentForm.reset({ prize_pool: 0 });
    this.editMode = false;
    this.currentTournamentId = undefined;
  }
}
