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
