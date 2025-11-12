import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié et admin
  if (authService.isAuthenticated() && authService.isAdmin()) {
    console.log('Admin access granted');
    return true;
  }
  alert('Accès refusé. Cette page est réservée aux administrateurs.');
  router.navigate(['/login']);
  return false;
};
