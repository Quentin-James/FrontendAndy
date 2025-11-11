import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 Admin Guard - Checking access');
  console.log('isAuthenticated:', authService.isAuthenticated());
  console.log('currentUser:', authService.currentUser());
  console.log('isAdmin:', authService.isAdmin());

  // Vérifier si l'utilisateur est authentifié et admin
  if (authService.isAuthenticated() && authService.isAdmin()) {
    console.log('✅ Admin access granted');
    return true;
  }

  console.log('❌ Admin access denied - redirecting to login');
  alert('Accès refusé. Cette page est réservée aux administrateurs.');
  router.navigate(['/login']);
  return false;
};
