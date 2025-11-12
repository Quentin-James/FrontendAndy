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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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

  /**
   * Soumet le formulaire de connexion
   * Authentifie l'utilisateur et le redirige selon son rôle (admin → dashboard, user → matches)
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          // Vérifier que l'utilisateur existe
          if (!response.user) {
            alert('Erreur: données utilisateur manquantes');
            this.loading = false;
            return;
          }

          // Rediriger directement selon le rôle
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']).then(() => {
              this.loading = false;
            });
          } else {
            this.router.navigate(['/matches']).then(() => {
              this.loading = false;
            });
          }
        },
        error: (error) => {
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
