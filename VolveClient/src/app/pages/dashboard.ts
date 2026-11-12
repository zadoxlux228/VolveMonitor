import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FieldService } from '../core/field.service';
import { WellService } from '../core/well.service';
import { ProductionRecordService } from '../core/production-record.service';
import { AuthService } from '../core/auth.service';
import { ProductionRecord } from '../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink, DatePipe, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule
  ],
  template: `
    <h1>Обзор системы</h1>
    <p class="subtitle">Добро пожаловать, {{ auth.currentUser()?.username }}.</p>

    @if (loading()) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (error()) {
      <mat-card class="error-card">
        Не удалось загрузить данные. Убедитесь, что VolveApi запущен
        и CORS настроен.
      </mat-card>
    } @else {
      <div class="stats">
        <mat-card class="stat">
          <mat-icon class="stat-icon">landscape</mat-icon>
          <div class="stat-value">{{ fieldsCount() }}</div>
          <div class="stat-label">Месторождений</div>
          <a mat-button color="primary" routerLink="/fields">Перейти</a>
        </mat-card>
        <mat-card class="stat">
          <mat-icon class="stat-icon">water_drop</mat-icon>
          <div class="stat-value">{{ wellsCount() }}</div>
          <div class="stat-label">Скважин</div>
          <a mat-button color="primary" routerLink="/wells">Перейти</a>
        </mat-card>
        <mat-card class="stat">
          <mat-icon class="stat-icon">monitoring</mat-icon>
          <div class="stat-value">{{ recordsCount() }}</div>
          <div class="stat-label">Замеров добычи</div>
          <a mat-button color="primary" routerLink="/records">Перейти</a>
        </mat-card>
      </div>

      <mat-card class="recent">
        <h2>Последние замеры</h2>
        <table mat-table [dataSource]="recent()">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Дата</th>
            <td mat-cell *matCellDef="let r">{{ r.productionDate | date:'dd.MM.yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="well">
            <th mat-header-cell *matHeaderCellDef>Скважина</th>
            <td mat-cell *matCellDef="let r">{{ r.wellName }}</td>
          </ng-container>
          <ng-container matColumnDef="oil">
            <th mat-header-cell *matHeaderCellDef>Нефть</th>
            <td mat-cell *matCellDef="let r">{{ r.oilVolume | number:'1.0-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="waterCut">
            <th mat-header-cell *matHeaderCellDef>Обводнённость, %</th>
            <td mat-cell *matCellDef="let r">{{ r.waterCut | number:'1.0-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="anomaly">
            <th mat-header-cell *matHeaderCellDef>Аномалия</th>
            <td mat-cell *matCellDef="let r">{{ r.hasAnomaly ? 'Да' : 'Нет' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    h1 { margin: 0 0 4px; }
    .subtitle { color: #607d8b; margin: 0 0 24px; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat { padding: 24px; text-align: center; }
    .stat-icon { font-size: 36px; width: 36px; height: 36px; color: #1976d2; }
    .stat-value { font-size: 36px; font-weight: 700; margin: 8px 0; }
    .stat-label { color: #607d8b; margin-bottom: 8px; }
    .recent { padding: 24px; }
    .recent h2 { margin: 0 0 16px; }
    .error-card { padding: 24px; background: #fdecea; color: #b71c1c; }
    table { width: 100%; }
  `]
})
export class Dashboard implements OnInit {
  private fieldService = inject(FieldService);
  private wellService = inject(WellService);
  private recordService = inject(ProductionRecordService);
  auth = inject(AuthService);

  loading = signal(true);
  error = signal(false);
  fieldsCount = signal(0);
  wellsCount = signal(0);
  recordsCount = signal(0);
  recent = signal<ProductionRecord[]>([]);

  columns = ['date', 'well', 'oil', 'waterCut', 'anomaly'];

  ngOnInit(): void {
    forkJoin({
      fields: this.fieldService.getAll(),
      wells: this.wellService.getAll(),
      records: this.recordService.getAll()
    }).subscribe({
      next: ({ fields, wells, records }) => {
        this.fieldsCount.set(fields.length);
        this.wellsCount.set(wells.length);
        this.recordsCount.set(records.length);
        this.recent.set(
          [...records]
            .sort((a, b) => b.productionDate.localeCompare(a.productionDate))
            .slice(0, 5)
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }
}