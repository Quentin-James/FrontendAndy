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
  template: `
    <div class="bet-container">
      <h1>💰 Placer un pari</h1>

      @if (match()) {
      <div class="match-card">
        <div class="match-header">
          <span class="tournament">{{ match()!.tournament?.name }}</span>
          <span class="format">{{ match()!.format }}</span>
        </div>

        <div class="teams">
          <div class="team">
            <img
              [src]="match()!.team1?.logo_url"
              [alt]="match()!.team1?.name"
            />
            <h3>{{ match()!.team1?.name }}</h3>
            <div class="odds">Cote: {{ match()!.odds_team1 }}</div>
          </div>

          <div class="vs">VS</div>

          <div class="team">
            <img
              [src]="match()!.team2?.logo_url"
              [alt]="match()!.team2?.name"
            />
            <h3>{{ match()!.team2?.name }}</h3>
            <div class="odds">Cote: {{ match()!.odds_team2 }}</div>
          </div>
        </div>

        <div class="match-date">
          📅 {{ match()!.scheduled_at | date : 'dd/MM/yyyy HH:mm' }}
        </div>
      </div>

      <div class="bet-form-card">
        <h2>Détails du pari</h2>

        <div class="user-balance">
          💰 Solde disponible: <strong>{{ currentUser()?.balance }}€</strong>
        </div>

        <form [formGroup]="betForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Parier sur *</label>
            <div class="team-choice">
              <label class="team-option">
                <input
                  type="radio"
                  formControlName="team_id"
                  [value]="match()!.team1_id"
                />
                <span
                  >{{ match()!.team1?.name }} (cote
                  {{ match()!.odds_team1 }})</span
                >
              </label>
              <label class="team-option">
                <input
                  type="radio"
                  formControlName="team_id"
                  [value]="match()!.team2_id"
                />
                <span
                  >{{ match()!.team2?.name }} (cote
                  {{ match()!.odds_team2 }})</span
                >
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Montant du pari (€) *</label>
            <input
              type="number"
              formControlName="amount"
              placeholder="50"
              min="1"
              [max]="maxBet"
              step="1"
            />
            <small>Montant minimum: 1€ | Maximum: {{ maxBet }}€</small>
          </div>

          @if (betForm.get('team_id')?.value && betForm.get('amount')?.value) {
          <div class="potential-win">
            <h3>💸 Gain potentiel</h3>
            <div class="win-amount">{{ calculatePotentialWin() }}€</div>
            <small>
              Mise: {{ betForm.get('amount')?.value }}€ × Cote:
              {{ getSelectedOdds() }} = {{ calculatePotentialWin() }}€
            </small>
          </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn-bet"
              [disabled]="betForm.invalid || loading"
            >
              {{ loading ? 'Traitement...' : '🎯 Confirmer le pari' }}
            </button>
            <button type="button" class="btn-cancel" (click)="goBack()">
              Annuler
            </button>
          </div>
        </form>
      </div>
      } @else {
      <div class="loading">Chargement du match...</div>
      }
    </div>
  `,
  styles: [
    `
      .bet-container {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }

      .match-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .match-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e0e0e0;
      }

      .tournament {
        font-weight: 600;
        color: #667eea;
      }

      .format {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
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
        margin-bottom: 12px;
      }

      .team h3 {
        margin: 8px 0;
        color: #333;
      }

      .odds {
        background: #4caf50;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        margin-top: 8px;
      }

      .vs {
        font-size: 24px;
        font-weight: bold;
        color: #999;
        padding: 0 20px;
      }

      .match-date {
        text-align: center;
        color: #666;
        margin-top: 16px;
      }

      .bet-form-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .bet-form-card h2 {
        margin-top: 0;
        color: #667eea;
      }

      .user-balance {
        background: #f1f8f4;
        border: 2px solid #4caf50;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        text-align: center;
        font-size: 18px;
      }

      .user-balance strong {
        color: #4caf50;
        font-size: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
      }

      .team-choice {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .team-option {
        background: #f5f5f5;
        border: 2px solid #e0e0e0;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .team-option:hover {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .team-option input[type='radio'] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .team-option input[type='radio']:checked + span {
        color: #667eea;
        font-weight: 600;
      }

      .team-option input[type='radio']:checked {
        accent-color: #667eea;
      }

      .form-group input[type='number'] {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
      }

      .form-group small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 12px;
      }

      .potential-win {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }

      .potential-win h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
      }

      .win-amount {
        font-size: 42px;
        font-weight: 700;
        margin: 12px 0;
      }

      .potential-win small {
        opacity: 0.9;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      .btn-bet,
      .btn-cancel {
        flex: 1;
        padding: 16px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-bet {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
      }

      .btn-bet:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-bet:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }

      .btn-cancel {
        background: #e0e0e0;
        color: #333;
      }

      .loading {
        text-align: center;
        padding: 60px 20px;
        color: #999;
        font-size: 18px;
      }
    `,
  ],
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
