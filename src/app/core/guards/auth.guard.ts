import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 Auth Guard - Checking access');
  console.log('isAuthenticated:', authService.isAuthenticated());
  console.log(
    'Token:',
    localStorage.getItem('access_token') ? 'exists' : 'missing'
  );

  if (authService.isAuthenticated()) {
    console.log('✅ Access granted');
    return true;
  }

  console.log('❌ Access denied - redirecting to login');
  router.navigate(['/login']);
  return false;
};
