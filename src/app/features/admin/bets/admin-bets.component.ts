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
    console.log('🏠 AdminBets component initialized');
    this.loadBets();
  }

  loadBets(): void {
    this.loading.set(true);
    this.error.set(null);
    console.log('📡 Loading all bets (admin)...');

    // Utiliser getAllBets() qui appelle GET /bets avec le token
    this.betService.getAllBets().subscribe({
      next: (bets) => {
        console.log('✅ All bets loaded:', bets);
        console.log('📊 Total bets:', bets.length);
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

  countByStatus(status: string): number {
    return this.bets().filter((bet) => bet.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      won: 'Gagné',
      lost: 'Perdu',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
