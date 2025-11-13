import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { MatchSchedulerService } from './core/services/match-scheduler.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 70px);
        background: #f5f5f5;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'E-Sport Betting';

  constructor(private matchScheduler: MatchSchedulerService) {}

  ngOnInit(): void {
    // Démarrer la mise à jour automatique des statuts de matchs
    this.matchScheduler.startAutoUpdate();
  }
}
