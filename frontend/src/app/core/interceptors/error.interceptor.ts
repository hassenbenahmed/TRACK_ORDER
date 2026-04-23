import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      switch (error.status) {
        case 401:
          authService.logout();
          snackBar.open('Session expirée. Veuillez vous reconnecter.', 'OK', { duration: 4000 });
          break;
        case 403:
          snackBar.open('Accès refusé.', 'OK', { duration: 4000 });
          break;
        case 409:
          snackBar.open(error.error?.message || 'Conflit de données.', 'OK', { duration: 4000 });
          break;
        case 0:
          snackBar.open('Impossible de contacter le serveur.', 'OK', { duration: 4000 });
          break;
        default:
          if (error.status >= 500) {
            snackBar.open('Erreur serveur. Réessayez plus tard.', 'OK', { duration: 4000 });
          }
      }
      return throwError(() => error);
    })
  );
};

