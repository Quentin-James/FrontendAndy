import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../../core/services/match.service';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css'],
})
export class MatchListComponent implements OnInit {
  selectedTab = signal<'scheduled' | 'live' | 'finished'>('scheduled');
  allMatches = signal<Match[]>([]);
  displayedMatches = signal<Match[]>([]);

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  /**
   * Charge tous les matchs depuis l'API et applique le filtre par défaut
   */
  loadMatches(): void {
    this.matchService.getAllMatches().subscribe((matches) => {
      this.allMatches.set(matches);
      this.filterMatches();
    });
  }

  /**
   * Change l'onglet actif et filtre les matchs selon le statut sélectionné
   * @param status - Statut des matchs à afficher (scheduled, live, finished)
   */
  selectTab(status: 'scheduled' | 'live' | 'finished'): void {
    this.selectedTab.set(status);
    this.filterMatches();
  }

  /**
   * Filtre les matchs selon le statut de l'onglet actif
   */
  filterMatches(): void {
    const filtered = this.allMatches().filter(
      (m) => m.status === this.selectedTab()
    );
    this.displayedMatches.set(filtered);
  }

  /**
   * Traduit le statut d'un match en français
   * @param status - Statut du match en anglais
   * @returns Label en français
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Programmé',
      live: 'En cours',
      finished: 'Terminé',
    };
    return labels[status] || status;
  }
}
