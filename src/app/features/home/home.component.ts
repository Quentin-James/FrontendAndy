import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {}

  /**
   * Initialise le composant et redirige automatiquement les utilisateurs authentifiés
   * - Admin → /admin/dashboard
   * - User → /matches
   * Ne redirige que si l'URL est exactement '/' ou '/home'
   */
  ngOnInit(): void {
    const currentUrl = this.router.url;

    // NE rediriger QUE si on est exactement sur '/' ou '/home'
    // ET PAS sur une sous-route comme /admin/bets
    if (currentUrl === '/' || currentUrl === '/home') {
      if (this.authService.isAuthenticated()) {
        const user = this.authService.currentUser();

        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/matches']);
        }
      }
    }
  }
}
