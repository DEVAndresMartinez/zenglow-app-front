import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { BACK_URL } from '../../../../../env';
import { ChangePasswordRequest, LoginRequest, LoginResponse, RecoverRequest, RecoverResponse, RefreshResponse } from '../../interfaces/auth.interface';

const ACCESS_KEY  = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Service()
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);

  // ── Endpoints ─────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BACK_URL}/auth/login`, credentials);
  }

  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${BACK_URL}/auth/refresh`, { refresh_token: refreshToken });
  }

  // ── Tokens ────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // ── Logout ────────────────────────────────────────────────────

  logout(): void {
    this.http.post<void>(`${BACK_URL}/auth/logout`, {}).pipe(
      finalize(() => {
        this.clearTokens();
        this.router.navigateByUrl('/modules/auth/login', { replaceUrl: true });
      })
    ).subscribe();
  }

  recoverPassword(request: RecoverRequest): Observable<RecoverResponse> {
    return this.http.post<RecoverResponse>(`${BACK_URL}/auth/recover-password`, request);
  }

  changePassword(useruuid: string, request: ChangePasswordRequest): Observable<RecoverResponse> {
    return this.http.post<RecoverResponse>(`${BACK_URL}/users/v1/${useruuid}/change-password`, request);
  }

}
