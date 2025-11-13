import { Injectable } from '@angular/core';
import { MatchService } from './match.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MatchSchedulerService {
  constructor(private matchService: MatchService) {}

  /**
   * Démarre la vérification automatique des statuts de matchs
   * Vérifie toutes les 5 minutes si des matchs doivent changer de statut
   */
  startAutoUpdate(): void {
    // Vérifier toutes les 5 minutes (300000 ms)
    interval(300000)
      .pipe(switchMap(() => this.matchService.getAllMatches()))
      .subscribe({
        next: () => {
          // Matchs mis à jour automatiquement
        },
        error: () => {
          // Gestion silencieuse de l'erreur
        },
      });
  }
}
