import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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
  templateUrl: './admin-matches.component.html',
  styleUrls: ['./admin-matches.component.css'],
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
    this.matchService
      .getAllMatches()
      .subscribe((matches) => this.matches.set(matches));
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
