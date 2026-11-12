import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <nav class="menu">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Обзор</span>
        </a>
        <a mat-list-item routerLink="/fields" routerLinkActive="active">
          <mat-icon matListItemIcon>landscape</mat-icon>
          <span matListItemTitle>Месторождения</span>
        </a>
        <a mat-list-item routerLink="/wells" routerLinkActive="active">
          <mat-icon matListItemIcon>water_drop</mat-icon>
          <span matListItemTitle>Скважины</span>
        </a>
        <a mat-list-item routerLink="/records" routerLinkActive="active">
          <mat-icon matListItemIcon>monitoring</mat-icon>
          <span matListItemTitle>Замеры добычи</span>
        </a>
      </mat-nav-list>
    </nav>
  `,
  styles: [`
    .menu {
      width: 240px;
      min-height: 100%;
      background: #fff;
      border-right: 1px solid #dde5ec;
    }
    .active { background: #e3f0fa; }
  `]
})
export class Menu {}