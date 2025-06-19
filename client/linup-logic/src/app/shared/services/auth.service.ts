import {Injectable, signal, computed, effect} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import {environment} from "../../../environments/environment";
import {NotificationService} from "./notification.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.API_BASE_PATH
  private tokenKey = 'Authorization';

  // ✅ Internal token state as a signal
  private _token = signal<string | null>(sessionStorage.getItem(this.tokenKey));
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
    ) {
    // 🔁 Keep sessionStorage in sync with signal
    effect(() => {
      const token = this._token();
      if (token) {
        sessionStorage.setItem(this.tokenKey, token);
      } else {
        sessionStorage.removeItem(this.tokenKey);
      }
    });
  }

  // ✅ Login returns an Observable (for use in components)
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/api/login`, { email, password }, { observe: 'response' }).pipe(
      tap(res => {
        if (res.status === 200 && res.body) {
          this._token.set(res.body.token);
        } else {
          this.notificationService.showNotification('Login failed', 'error');
        }
      }),
      // Map back to the expected return type
      map(res => res.body as { token: string })
    );
  }

  logout() {
    this._token.set(null);
    this.http.delete(`${this.apiUrl}/api/logout`);
    this.router.navigate(['/login']);
  }

  // ✅ Refresh still returns Observable (required for interceptor)
  refreshToken(): Observable<{token: string}> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/api/refresh_token`, {}, { observe: 'response' }).pipe(
      tap(res => {
        if (res.status === 200 && res.body) {
          this._token.set(res.body.token);
        }
      }),
      // Map back to the expected return type
      map(res => res.body as { token: string })
    );
  }

  getToken(): string | null {
    return this._token();
  }

  // Method to set token directly (for use after signup)
  setToken(token: string): void {
    this._token.set(token);
  }
}
