import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginDto,
  LoginResponse,
  RegisterDto,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  private loadingProfile = false;

  constructor(private http: HttpClient, private router: Router) {
    this.loadCurrentUser();
  }

  /**
   * Authentifie un utilisateur avec son email et mot de passe
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   * @returns Observable contenant le token d'accès et les informations utilisateur
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (!response.access_token) {
            throw new Error('Invalid API response: missing access_token');
          }

          if (!response.user) {
            throw new Error('Invalid API response: missing user object');
          }

          localStorage.setItem('access_token', response.access_token);

          // Sauvegarder l'utilisateur dans localStorage
          if (response.user) {
            localStorage.setItem('current_user', JSON.stringify(response.user));
            this.currentUser.set(response.user);
          }

          this.isAuthenticated.set(true);
        })
      );
  }

  /**
   * Enregistre un nouvel utilisateur
   * @param data - Données d'inscription (username, email, password)
   * @returns Observable contenant l'utilisateur créé
   */
  register(data: RegisterDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, data);
  }

  /**
   * Déconnecte l'utilisateur actuel et nettoie les données de session
   */
  logout(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .post(`${this.apiUrl}/logout`, { refresh_token: token })
        .subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  /**
   * Récupère le profil de l'utilisateur actuellement connecté
   * @returns Observable contenant les informations complètes de l'utilisateur
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        // Sauvegarder dans localStorage pour BetService
        localStorage.setItem('current_user', JSON.stringify(user));

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Rafraîchit le token d'accès en utilisant le refresh token
   * @param refreshToken - Token de rafraîchissement
   * @returns Observable contenant le nouveau token d'accès
   */
  refreshToken(refreshToken: string): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
        })
      );
  }

  /**
   * Charge les informations de l'utilisateur depuis le localStorage au démarrage
   * @private
   */
  private loadCurrentUser(): void {
    const token = localStorage.getItem('access_token');

    if (token && !this.loadingProfile) {
      this.loadingProfile = true;

      this.getProfile().subscribe({
        next: (user) => {
          this.loadingProfile = false;
        },
        error: (error) => {
          this.logout();
          this.loadingProfile = false;
        },
      });
    }
  }

  /**
   * Vérifie si l'utilisateur actuel a le rôle d'administrateur
   * @returns true si l'utilisateur est admin, false sinon
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  /**
   * Récupère le token d'accès depuis le localStorage
   * @returns Le token d'accès ou null s'il n'existe pas
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
