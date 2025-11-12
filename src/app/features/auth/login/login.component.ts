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
