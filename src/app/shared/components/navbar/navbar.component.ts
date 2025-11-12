import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  menuOpen = false;

  // Utiliser des getters au lieu d'initialiser avant le constructeur
  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isAdmin() {
    return this.authService.isAdmin();
  }

  constructor(private authService: AuthService) {}

  /**
   * Déconnecte l'utilisateur actuel et le redirige vers la page d'accueil
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Bascule l'état du menu mobile (ouvert/fermé)
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Ferme le menu mobile
   * Utilisé après un clic sur un lien de navigation
   */
  closeMenu(): void {
    this.menuOpen = false;
  }
}
