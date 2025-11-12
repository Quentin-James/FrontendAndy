import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BetService } from '../../../core/services/bet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Bet } from '../../../core/models/bet.model';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bets.component.html',
  styleUrls: ['./my-bets.component.css'],
})
export class MyBetsComponent implements OnInit {
  bets = signal<Bet[]>([]);

  constructor(
    private betService: BetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBets();
  }

  /**
   * Charge la liste des paris de l'utilisateur connecté depuis l'API
   */
  loadBets(): void {
    this.betService.getMyBets().subscribe({
      next: (bets) => {
        this.bets.set(bets);
      },
      error: (error) => {
        alert('Erreur lors du chargement des paris');
      },
    });
  }

  /**
   * Compte le nombre de paris par statut
   * @param status - Statut à compter (pending, won, lost, cancelled)
   * @returns Nombre de paris avec ce statut
   */
  countByStatus(status: string): number {
    return this.bets().filter((b) => b.status === status).length;
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
}
