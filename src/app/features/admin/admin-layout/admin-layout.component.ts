import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../../core/services/bet.service';
import { Bet } from '../../../core/models/bet.model';
import { RouterOutlet } from '@angular/router';

/**
 * Composant Layout Admin
 * Conteneur de routage pour toutes les pages d'administration
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  bets = signal<Bet[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private betService: BetService) {}

  ngOnInit(): void {
    this.loadBets();
  }

  /**
   * Charge tous les paris
   * Appelle le service BetService pour récupérer les paris
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
        console.error('❌ Error loading bets:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.error?.message);

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
   * @param status Le statut des paris à compter
   * @returns Le nombre de paris avec le statut donné
   */
  countByStatus(status: string): number {
    return this.bets().filter((bet) => bet.status === status).length;
  }

  /**
   * Obtient l'étiquette d'un statut
   * @param status Le statut dont on veut l'étiquette
   * @returns L'étiquette du statut
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
   * Analyse une chaîne en tant que nombre à virgule flottante
   * @param value La chaîne à analyser
   * @returns Le nombre à virgule flottante analysé
   */
  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
