import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-toolbar class="header">
      <div class="brand">
        <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 4 L34 40 L14 40 Z" fill="none" stroke="currentColor" stroke-width="2.5"/>
          <path d="M18 28 L30 28 M20 20 L28 20 M22 12 L26 12" stroke="currentColor" stroke-width="2"/>
          <path d="M10 40 L38 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 14 c3 4 5 6.5 5 9 a5 5 0 1 1 -10 0 c0 -2.5 2 -5 5 -9z" fill="currentColor"/>
        </svg>
        <span class="brand-name">Volve<span class="brand-accent">Monitor</span></span>
      </div>

      <span class="spacer"></span>

      @if (auth.currentUser(); as user) {
        <div class="user">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name">{{ user.username }}</span>
          <span class="user-role">{{ user.role }}</span>
          <button mat-icon-button matTooltip="Выйти" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      }
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0d2b45;
      color: #fff;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-name { font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    .brand-accent { color: #4fc3f7; }
    .spacer { flex: 1; }
    .user { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .user-role {
      background: #1e4a6e;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
  `]
})
export class Header {
  auth = inject(AuthService);
}