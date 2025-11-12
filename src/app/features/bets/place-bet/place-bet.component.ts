import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../../../core/services/match.service';
import { BetService } from '../../../core/services/bet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-place-bet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './place-bet.component.html',
  styleUrls: ['./place-bet.component.css'],
})
export class PlaceBetComponent implements OnInit {
  match = signal<Match | null>(null);
  betForm: FormGroup;
  loading = false;
  currentUser = this.authService.currentUser;

  // Cotes par défaut si le backend ne les fournit pas
  defaultOdds = {
    team1: 1.85,
    team2: 2.1,
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private betService: BetService,
    private authService: AuthService
  ) {
    this.betForm = this.fb.group({
      team_id: ['', Validators.required], // ← Changer de selected_team_id à team_id
      amount: [50, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    const matchId = Number(this.route.snapshot.paramMap.get('id'));
    if (matchId) {
      this.loadMatch(matchId);
    }
  }

  loadMatch(id: number): void {
    console.log('📡 Loading match:', id);
    this.matchService.getMatchById(id).subscribe({
      next: (match) => {
        console.log('✅ Match loaded:', match);

        // Si le backend ne retourne pas les cotes, utiliser les valeurs par défaut
        const matchWithOdds = {
          ...match,
          odds_team1: match.odds_team1 || this.defaultOdds.team1,
          odds_team2: match.odds_team2 || this.defaultOdds.team2,
        };

        console.log('📊 Odds:', {
          team1: matchWithOdds.odds_team1,
          team2: matchWithOdds.odds_team2,
        });

        this.match.set(matchWithOdds);
      },
      error: (error) => {
        console.error('❌ Error loading match:', error);
        alert('Impossible de charger le match');
        this.router.navigate(['/matches']);
      },
    });
  }

  get maxBet(): number {
    const user = this.currentUser();
    return user ? parseFloat(user.balance) : 0;
  }

  getSelectedOdds(): number {
    const selectedTeamId = this.betForm.get('team_id')?.value; // ← Changer ici aussi
    const currentMatch = this.match();
    if (!currentMatch || !selectedTeamId) return 0;

    return selectedTeamId === currentMatch.team1_id
      ? currentMatch.odds_team1 ?? this.defaultOdds.team1
      : currentMatch.odds_team2 ?? this.defaultOdds.team2;
  }

  calculatePotentialWin(): string {
    const amount = this.betForm.get('amount')?.value;
    const odds = this.getSelectedOdds();
    if (!amount || !odds) return '0.00';

    const win = amount * odds;
    return win.toFixed(2);
  }

  onSubmit(): void {
    if (this.betForm.valid && this.match()) {
      this.loading = true;
      const user = this.currentUser();

      if (!user) {
        alert('❌ Vous devez être connecté pour parier');
        this.router.navigate(['/login']);
        return;
      }

      const amount = Number(this.betForm.value.amount);
      const currentBalance = parseFloat(user.balance);

      if (amount > currentBalance) {
        alert(
          `❌ Solde insuffisant.\n\nSolde actuel: ${currentBalance.toFixed(
            2
          )}€\nMontant du pari: ${amount.toFixed(2)}€`
        );
        this.loading = false;
        return;
      }

      const odds = this.getSelectedOdds();
      const data = {
        match_id: this.match()!.id,
        team_id: this.betForm.value.team_id, // ← Changer de selected_team_id à team_id
        amount: amount,
        odds: odds,
      };

      console.log('🎯 Placing bet:', data);
      console.log('📊 Bet details:', {
        match: this.match()!.team1?.name + ' vs ' + this.match()!.team2?.name,
        selectedTeam:
          this.betForm.value.team_id === this.match()!.team1_id
            ? this.match()!.team1?.name
            : this.match()!.team2?.name,
        amount: amount,
        odds: odds,
        potentialWin: this.calculatePotentialWin(),
      });

      this.betService.createBet(data).subscribe({
        next: (bet) => {
          console.log('✅ Bet placed successfully:', bet);
          console.log('🆔 Bet ID:', bet.id);

          alert(
            `✅ Pari placé avec succès !\n\n` +
              `Mise: ${amount.toFixed(2)}€\n` +
              `Cote: ${odds}\n` +
              `Gain potentiel: ${this.calculatePotentialWin()}€`
          );

          console.log('🔄 Redirecting to /bets/my-bets');
          this.router.navigate(['/bets/my-bets']);
        },
        error: (error) => {
          console.error('❌ Error placing bet:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error details:', error.error);

          let errorMsg = 'Impossible de placer le pari';

          if (error.status === 400) {
            errorMsg = error.error?.message || 'Données invalides';
          } else if (error.status === 401) {
            errorMsg = 'Vous devez être connecté';
            this.router.navigate(['/login']);
          } else if (error.status === 403) {
            errorMsg = 'Solde insuffisant ou match non disponible';
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }

          alert(`Erreur: ${errorMsg}`);
          this.loading = false;
        },
        complete: () => {
          console.log('✅ Bet placement completed');
          this.loading = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/matches']);
  }
}
