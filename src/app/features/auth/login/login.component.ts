import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🎮 E-Sport Betting</h1>
          <h2>Connexion</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="admin@admin.com"
              [class.error]="
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
            >
              <span *ngIf="loginForm.get('email')?.hasError('required')"
                >Email requis</span
              >
              <span *ngIf="loginForm.get('email')?.hasError('email')"
                >Email invalide</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••"
              [class.error]="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            >
              <span *ngIf="loginForm.get('password')?.hasError('required')"
                >Mot de passe requis</span
              >
            </div>
          </div>

          <button
            type="submit"
            class="btn-primary"
            [disabled]="loginForm.invalid || loading"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="register-link">
          <p>Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
        </div>

        <div class="demo-credentials">
          <p><strong>Compte de test :</strong></p>
          <p>Email: test@test.com</p>
          <p>Password: 123456</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 40px;
        width: 100%;
        max-width: 450px;
      }

      .login-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .login-header h1 {
        font-size: 32px;
        margin-bottom: 10px;
        color: #667eea;
      }

      .login-header h2 {
        font-size: 24px;
        color: #333;
        margin: 0;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
      }

      .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
      }

      .form-group input.error {
        border-color: #f44336;
      }

      .error-message {
        color: #f44336;
        font-size: 14px;
        margin-top: 5px;
      }

      .btn-primary {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .register-link {
        text-align: center;
        margin-top: 20px;
      }

      .register-link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
      }

      .demo-credentials {
        margin-top: 30px;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
        text-align: center;
        font-size: 14px;
      }

      .demo-credentials p {
        margin: 5px 0;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['test@test.com', [Validators.required, Validators.email]],
      password: ['123456', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      console.log('🔐 Attempting login...');

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('✅ Login successful:', response);
          console.log('User role:', response.user?.role);

          // Vérifier que l'utilisateur existe
          if (!response.user) {
            console.error('❌ User missing in response!');
            alert('Erreur: données utilisateur manquantes');
            this.loading = false;
            return;
          }

          // Rediriger directement selon le rôle
          if (response.user.role === 'admin') {
            console.log('🔄 Admin login - redirecting to dashboard');
            this.router.navigate(['/admin/dashboard']).then(() => {
              console.log('✅ Navigation complete');
              this.loading = false;
            });
          } else {
            console.log('🔄 User login - redirecting to matches');
            this.router.navigate(['/matches']).then(() => {
              console.log('✅ Navigation complete');
              this.loading = false;
            });
          }
        },
        error: (error) => {
          console.error('❌ Login error:', error);

          let errorMessage = 'Erreur de connexion';

          if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage =
              'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:3000';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          alert(errorMessage);
          this.loading = false;
        },
      });
    }
  }
}
