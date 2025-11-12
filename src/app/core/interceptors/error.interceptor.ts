import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Une erreur est survenue';

      switch (error.status) {
        case 400:
          message = error.error?.message || 'Données invalides';
          break;
        case 401:
          message = 'Non autorisé - Veuillez vous connecter';
          router.navigate(['/login']);
          break;
        case 403:
          message = 'Accès refusé';
          break;
        case 404:
          message = 'Ressource non trouvée';
          break;
        case 409:
          message = error.error?.message || 'Conflit';
          break;
        case 500:
          message = 'Erreur serveur';
          break;
      }

      console.error('HTTP Error:', message, error);

      return throwError(() => error);
    })
  );
};
