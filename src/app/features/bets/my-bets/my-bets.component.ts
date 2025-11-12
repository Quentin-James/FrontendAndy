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
    console.log('🏠 MyBets component initialized');
    this.loadBets();
  }

  loadBets(): void {
    console.log('📡 Loading my bets...');

    this.betService.getMyBets().subscribe({
      next: (bets) => {
        console.log('✅ Bets loaded:', bets);
        console.log('📊 Total bets:', bets.length);
        this.bets.set(bets);
      },
      error: (error) => {
        console.error('❌ Error loading bets:', error);
        alert('Erreur lors du chargement des paris');
      },
    });
  }

  countByStatus(status: string): number {
    return this.bets().filter((b) => b.status === status).length;
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
}
