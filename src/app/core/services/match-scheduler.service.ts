import { Injectable } from '@angular/core';
import { MatchService } from './match.service';
import { BetService } from './bet.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MatchSchedulerService {
  constructor(
    private matchService: MatchService,
    private betService: BetService
  ) {}

  /**
   * Démarre la vérification automatique des statuts de matchs
   * Vérifie toutes les 5 minutes si des matchs doivent changer de statut
   * Et résout automatiquement les paris des matchs terminés
   */
  startAutoUpdate(): void {
    // Vérifier toutes les 5 minutes (300000 ms)
    interval(300000)
      .pipe(switchMap(() => this.matchService.getAllMatches()))
      .subscribe({
        next: (matches) => {
          // Vérifier les matchs qui viennent de passer en finished
          matches.forEach((match) => {
            if (match.status === 'finished' && match.winner_id) {
              // Résoudre automatiquement les paris
              this.betService.resolveBets(match.id, match.winner_id).subscribe({
                next: (resolvedBets) => {
                  if (resolvedBets.length > 0) {
                    console.log(
                      `✅ Auto-résolution: ${resolvedBets.length} paris résolus pour le match #${match.id}`
                    );
                  }
                },
                error: (error) => {
                  console.error(
                    `❌ Erreur auto-résolution match #${match.id}:`,
                    error
                  );
                },
              });
            }
          });
        },
        error: () => {
          // Gestion silencieuse de l'erreur
        },
      });
  }
}
