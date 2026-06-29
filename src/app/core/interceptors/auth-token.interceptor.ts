import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { RefreshResponse } from '../interfaces/auth.interface';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_PATHS.some(path => url.includes(path));
}

function cloneWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Los endpoints de auth no llevan token en el header
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = auth.getAccessToken();
  const outgoing = token ? cloneWithToken(req, token) : req;

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject.next(null);

        const refreshToken = auth.getRefreshToken();
        if (!refreshToken) {
          isRefreshing = false;
          auth.logout();
          return throwError(() => err);
        }

        return auth.refresh(refreshToken).pipe(
          catchError(refreshErr => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => refreshErr);
          }),
          switchMap((res: RefreshResponse) => {
            isRefreshing = false;
            auth.saveTokens(res.access_token, res.refresh_token ?? refreshToken);
            refreshSubject.next(res.access_token);
            return next(cloneWithToken(req, res.access_token));
          })
        );
      }

      // Otra petición ya está refrescando: esperar el nuevo token y reintentar
      return refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next(cloneWithToken(req, token!)))
      );
    })
  );
};
