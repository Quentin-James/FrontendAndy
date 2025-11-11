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

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔄 Attempting login with:', { email, apiUrl: this.apiUrl });

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          console.log(
            '📥 Raw API response:',
            JSON.stringify(response, null, 2)
          );

          if (!response.access_token) {
            console.error('❌ Missing access_token in response');
            throw new Error('Invalid API response: missing access_token');
          }

          if (!response.user) {
            console.error('❌ Missing user object in response');
            throw new Error('Invalid API response: missing user object');
          }

          console.log('👤 User object:', response.user);
          console.log('👤 User role:', response.user.role);

          localStorage.setItem('access_token', response.access_token);

          // Sauvegarder l'utilisateur dans localStorage
          if (response.user) {
            localStorage.setItem('current_user', JSON.stringify(response.user));
            this.currentUser.set(response.user);
          }

          this.isAuthenticated.set(true);

          console.log('✅ Login successful!');
          console.log('✅ User stored:', this.currentUser());
          console.log('✅ isAuthenticated:', this.isAuthenticated());
        })
      );
  }

  register(data: RegisterDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, data);
  }

  logout(): void {
    console.log('🚪 Logging out...');
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .post(`${this.apiUrl}/logout`, { refresh_token: token })
        .subscribe();
    }
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  getProfile(): Observable<User> {
    console.log('📡 Fetching current user profile...');
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        console.log('✅ Profile loaded from API:', user);
        console.log('💰 Balance:', user.balance);

        // Sauvegarder dans localStorage pour BetService
        localStorage.setItem('current_user', JSON.stringify(user));

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

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

  private loadCurrentUser(): void {
    const token = localStorage.getItem('access_token');
    console.log('🔄 Loading current user...');
    console.log('Token exists:', !!token);

    if (token && !this.loadingProfile) {
      this.loadingProfile = true;
      console.log('📡 Fetching profile from API...');

      this.getProfile().subscribe({
        next: (user) => {
          console.log('✅ Profile loaded successfully:', user);
          this.loadingProfile = false;
        },
        error: (error) => {
          console.error('❌ Failed to load profile:', error);
          console.log('Token might be invalid or expired');
          this.logout();
          this.loadingProfile = false;
        },
      });
    } else if (!token) {
      console.log('No token found - user not authenticated');
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    console.log('isAdmin check - currentUser:', user);
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
