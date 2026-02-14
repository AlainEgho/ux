import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  AUTH_API,
  ApiResponse,
  AuthData,
  SignupRequest,
  LoginRequest,
} from './auth-api.model';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<AuthData | null>(this.getStoredUser());

  readonly isAuthenticated = computed(() => !!this.token());
  readonly currentUser = computed(() => this.user());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getAccessToken(): string | null {
    return this.token();
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthData | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthData;
    } catch {
      return null;
    }
  }

  private setSession(data: AuthData): void {
    this.token.set(data.accessToken);
    this.user.set(data);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/signin']);
  }

  signup(body: SignupRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(AUTH_API.signup, body)
      .pipe(
        tap((res) => {
          if (res.success && res.data) this.setSession(res.data);
        })
      );
  }

  login(body: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(AUTH_API.login, body)
      .pipe(
        tap((res) => {
          if (res.success && res.data) this.setSession(res.data);
        })
      );
  }

  verifyEmail(token: string): Observable<ApiResponse<null>> {
    return this.http.get<ApiResponse<null>>(AUTH_API.verifyEmail(token));
  }
}
