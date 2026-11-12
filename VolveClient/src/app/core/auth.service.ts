import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './api';
import { LoginRequest, LoginResponse, SessionUser } from './models';

function decodeToken(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function extractRole(claims: Record<string, any>): string {
  const role =
    claims['role'] ??
    claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    '';
  return Array.isArray(role) ? role[0] : String(role);
}

function extractUsername(claims: Record<string, any>): string {
  return (
    claims['unique_name'] ??
    claims['name'] ??
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
    ''
  );
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<SessionUser | null>(this.restoreSession());

  private restoreSession(): SessionUser | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const claims = decodeToken(token);
    if (!claims) return null;

    if (claims['exp'] && claims['exp'] * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return {
      username: extractUsername(claims),
      role: extractRole(claims)
    };
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${API_URL}/Auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const claims = decodeToken(response.token) ?? {};
        this.currentUser.set({
          username: response.username ?? extractUsername(claims),
          role: response.role ?? extractRole(claims)
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }
}