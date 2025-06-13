import {Injectable, signal, computed, effect, Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.API_BASE_PATH
  private tokenKey = 'Authorization';

  // ✅ Internal token state as a signal
  private _token = signal<string | null>(sessionStorage.getItem(this.tokenKey));
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient, private router: Router) {
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
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this._token.set(res.token)),
      tap(() => console.log('Login successful'))
    );
  }

  logout() {
    this._token.set(null);
    this.http.delete(`${this.apiUrl}/logout`).subscribe(); // optional
    this.router.navigate(['/login']);
  }

  // ✅ Refresh still returns Observable (required for interceptor)
  refreshToken(): Observable<{token: string}> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(res => this._token.set(res.token)),
      tap(() => console.log('Token refreshed'))
    );
  }

  getToken(): string | null {
    return this._token();
  }
}
