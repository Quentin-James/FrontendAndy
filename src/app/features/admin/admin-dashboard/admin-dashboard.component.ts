import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { MatchService } from '../../../core/services/match.service';
import { BetService } from '../../../core/services/bet.service';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = signal(0);
  totalMatches = signal(0);
  totalBets = signal(0);
  totalTeams = signal(0);

  constructor(
    private userService: UserService,
    private matchService: MatchService,
    private betService: BetService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * Charge les statistiques du dashboard (nombres d'utilisateurs, matchs, paris, équipes)
   */
  loadStats(): void {
    this.userService
      .getAllUsers()
      .subscribe((users) => this.totalUsers.set(users.length));

    this.matchService
      .getAllMatches()
      .subscribe((matches) => this.totalMatches.set(matches.length));

    const betServiceAny = this.betService as any;
    if (typeof betServiceAny.getAllBets === 'function') {
      betServiceAny
        .getAllBets()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else if (typeof betServiceAny.getBets === 'function') {
      betServiceAny
        .getBets()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else if (typeof betServiceAny.getAll === 'function') {
      betServiceAny
        .getAll()
        .subscribe((bets: any[]) => this.totalBets.set(bets.length));
    } else {
      this.totalBets.set(0);
    }

    this.teamService
      .getAllTeams()
      .subscribe((teams) => this.totalTeams.set(teams.length));
  }
}
