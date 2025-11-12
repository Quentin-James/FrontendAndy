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
