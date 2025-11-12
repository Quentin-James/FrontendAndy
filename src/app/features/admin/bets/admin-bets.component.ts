import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../../core/services/bet.service';
import { Bet } from '../../../core/models/bet.model';

@Component({
  selector: 'app-admin-bets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bets.component.html',
  styleUrls: ['./admin-bets.component.css'],
})
export class AdminBetsComponent implements OnInit {
  bets = signal<Bet[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private betService: BetService) {}

  ngOnInit(): void {
    this.loadBets();
  }

  /**
   * Charge tous les paris de la plateforme (accès admin uniquement)
   */
  loadBets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.betService.getAllBets().subscribe({
      next: (bets) => {
        this.bets.set(bets);
        this.loading.set(false);
      },
      error: (error) => {
        let errorMsg = 'Erreur lors du chargement des paris';

        if (error.status === 401) {
          errorMsg = 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 404) {
          errorMsg = 'Endpoint GET /bets non disponible';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        this.error.set(errorMsg);
        this.loading.set(false);
      },
    });
  }

  /**
   * Compte le nombre de paris par statut
   * @param status - Statut à compter (pending, won, lost, cancelled)
   * @returns Nombre de paris avec ce statut
   */
  countByStatus(status: string): number {
    return this.bets().filter((bet) => bet.status === status).length;
  }

  /**
   * Traduit le statut d'un pari en français
   * @param status - Statut du pari en anglais
   * @returns Label en français
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      won: 'Gagné',
      lost: 'Perdu',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }

  /**
   * Convertit une chaîne en nombre décimal
   * @param value - Valeur à convertir
   * @returns Nombre décimal
   */
  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
