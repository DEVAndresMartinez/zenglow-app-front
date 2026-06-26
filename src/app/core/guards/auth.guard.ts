import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { CommerceService } from '../services/modules/commerces/commerce.service';

export const authGuard: CanActivateFn = () => {
  const auth            = inject(AuthService);
  const router          = inject(Router);
  const commerceService = inject(CommerceService);

  if (!auth.isAuthenticated()) {
    router.navigateByUrl('/modules/auth/login', { replaceUrl: true });
    return false;
  }

  if (commerceService.me()) {
    return true;
  }

  return commerceService.getMeCommerce().pipe(
    map(data => {
      commerceService.me.set(data);
      return true;
    }),
    catchError(() => {
      auth.logout();
      return of(false);
    })
  );
};
