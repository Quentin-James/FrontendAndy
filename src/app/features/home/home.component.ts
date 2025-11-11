import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>🎮 E-Sport Betting</h1>
        <p>La plateforme de paris e-sport nouvelle génération</p>

        @if (authService.isAuthenticated()) { @if (authService.isAdmin()) {
        <a routerLink="/admin/dashboard" class="btn-hero">👑 Dashboard Admin</a>
        } @else {
        <a routerLink="/matches" class="btn-hero">⚔️ Voir les matchs</a>
        } } @else {
        <a routerLink="/login" class="btn-hero">Se connecter</a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        min-height: calc(100vh - 70px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .hero {
        text-align: center;
        color: white;
      }

      .hero h1 {
        font-size: 64px;
        margin-bottom: 20px;
      }

      .hero p {
        font-size: 24px;
        margin-bottom: 40px;
      }

      .btn-hero {
        display: inline-block;
        padding: 16px 32px;
        background: white;
        color: #667eea;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 18px;
        transition: transform 0.2s;
      }

      .btn-hero:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('🏠 Home component initialized');
    console.log('Current route:', this.router.url);

    const currentUrl = this.router.url;

    // NE rediriger QUE si on est exactement sur '/' ou '/home'
    // ET PAS sur une sous-route comme /admin/bets
    if (currentUrl === '/' || currentUrl === '/home') {
      console.log('On homepage - checking authentication...');

      if (this.authService.isAuthenticated()) {
        const user = this.authService.currentUser();
        console.log('User authenticated:', user);

        if (this.authService.isAdmin()) {
          console.log('🔄 Redirecting admin to dashboard...');
          this.router.navigate(['/admin/dashboard']);
        } else {
          console.log('🔄 Redirecting user to matches...');
          this.router.navigate(['/matches']);
        }
      }
    } else {
      console.log(
        'Not on homepage, skipping redirect. Current URL:',
        currentUrl
      );
    }
  }
}
