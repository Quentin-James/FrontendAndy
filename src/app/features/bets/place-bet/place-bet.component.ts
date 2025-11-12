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

  /**
   * Charge les détails d'un match depuis l'API
   * Applique des cotes par défaut si le backend ne les fournit pas
   * @param id - ID du match à charger
   */
  loadMatch(id: number): void {
    this.matchService.getMatchById(id).subscribe({
      next: (match) => {
        // Si le backend ne retourne pas les cotes, utiliser les valeurs par défaut
        const matchWithOdds = {
          ...match,
          odds_team1: match.odds_team1 || this.defaultOdds.team1,
          odds_team2: match.odds_team2 || this.defaultOdds.team2,
        };

        this.match.set(matchWithOdds);
      },
      error: (error) => {
        alert('Impossible de charger le match');
        this.router.navigate(['/matches']);
      },
    });
  }

  /**
   * Retourne le montant maximum qu'un utilisateur peut parier (son solde actuel)
   * @returns Solde disponible de l'utilisateur
   */
  get maxBet(): number {
    const user = this.currentUser();
    return user ? parseFloat(user.balance) : 0;
  }

  /**
   * Récupère la cote de l'équipe sélectionnée dans le formulaire
   * @returns Cote de l'équipe sélectionnée
   */
  getSelectedOdds(): number {
    const selectedTeamId = this.betForm.get('team_id')?.value; // ← Changer ici aussi
    const currentMatch = this.match();
    if (!currentMatch || !selectedTeamId) return 0;

    return selectedTeamId === currentMatch.team1_id
      ? currentMatch.odds_team1 ?? this.defaultOdds.team1
      : currentMatch.odds_team2 ?? this.defaultOdds.team2;
  }

  /**
   * Calcule le gain potentiel du pari (montant × cote)
   * @returns Gain potentiel formaté avec 2 décimales
   */
  calculatePotentialWin(): string {
    const amount = this.betForm.get('amount')?.value;
    const odds = this.getSelectedOdds();
    if (!amount || !odds) return '0.00';

    const win = amount * odds;
    return win.toFixed(2);
  }

  /**
   * Soumet le formulaire de pari
   * Vérifie le solde, crée le pari et redirige vers la page des paris
   */
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
        team_id: this.betForm.value.team_id,
        amount: amount,
        odds: odds,
      };

      this.betService.createBet(data).subscribe({
        next: (bet) => {
          alert(
            `✅ Pari placé avec succès !\n\n` +
              `Mise: ${amount.toFixed(2)}€\n` +
              `Cote: ${odds}\n` +
              `Gain potentiel: ${this.calculatePotentialWin()}€`
          );

          this.router.navigate(['/bets/my-bets']);
        },
        error: (error) => {
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
          this.loading = false;
        },
      });
    }
  }

  /**
   * Retourne à la page de la liste des matchs
   */
  goBack(): void {
    this.router.navigate(['/matches']);
  }
}
