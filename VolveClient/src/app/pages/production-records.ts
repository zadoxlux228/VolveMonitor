import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductionRecordService } from '../core/production-record.service';
import { WellService } from '../core/well.service';
import { AuthService } from '../core/auth.service';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { DOWNTIME_LABELS, DowntimeReason, ProductionRecord } from '../core/models';

@Component({
  selector: 'app-production-records',
  imports: [
    RouterLink, DatePipe, DecimalPipe,
    MatTableModule, MatSortModule, MatCardModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatTooltipModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-head">
      <div>
        <h1>Замеры добычи</h1>
        <p class="subtitle">Найдено: {{ rows().length }} из {{ records().length }}</p>
      </div>
      <div class="head-actions">
        <mat-button-toggle-group [value]="viewMode()" (change)="viewMode.set($event.value)">
          <mat-button-toggle value="table" matTooltip="Таблица">
            <mat-icon>table_rows</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="cards" matTooltip="Карточки">
            <mat-icon>grid_view</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>
        @if (auth.isAdmin()) {
          <a mat-flat-button color="primary" routerLink="/records/new">
            <mat-icon>add</mat-icon> Добавить
          </a>
        }
      </div>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search">
        <mat-label>Поиск</mat-label>
        <input matInput placeholder="Скважина или месторождение" (input)="onSearch($event)">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter">
        <mat-label>Скважина</mat-label>
        <mat-select [value]="wellFilter()" (selectionChange)="wellFilter.set($event.value)">
          <mat-option [value]="null">Все</mat-option>
          @for (w of wells(); track w.id) {
            <mat-option [value]="w.id">{{ w.wellName }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter">
        <mat-label>Аномалия</mat-label>
        <mat-select [value]="anomalyFilter()" (selectionChange)="anomalyFilter.set($event.value)">
          <mat-option [value]="null">Все</mat-option>
          <mat-option [value]="true">Только аномальные</mat-option>
          <mat-option [value]="false">Без аномалий</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (error()) {
      <mat-card class="error-card">Не удалось загрузить замеры.</mat-card>
    } @else if (viewMode() === 'table') {
      <mat-card class="panel">
        <table mat-table [dataSource]="rows()" matSort (matSortChange)="onSort($event)">
          <ng-container matColumnDef="productionDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="productionDate">Дата</th>
            <td mat-cell *matCellDef="let r">{{ r.productionDate | date:'dd.MM.yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="wellName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="wellName">Скважина</th>
            <td mat-cell *matCellDef="let r">{{ r.wellName }}</td>
          </ng-container>
          <ng-container matColumnDef="fieldName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="fieldName">Месторождение</th>
            <td mat-cell *matCellDef="let r">{{ r.fieldName }}</td>
          </ng-container>
          <ng-container matColumnDef="oilVolume">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="oilVolume">Нефть</th>
            <td mat-cell *matCellDef="let r">{{ r.oilVolume | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="gasVolume">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="gasVolume">Газ</th>
            <td mat-cell *matCellDef="let r">{{ r.gasVolume | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="waterVolume">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="waterVolume">Вода</th>
            <td mat-cell *matCellDef="let r">{{ r.waterVolume | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="waterCut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="waterCut">Обводнённость, %</th>
            <td mat-cell *matCellDef="let r">{{ r.waterCut | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="efficiency">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="efficiency">Эффективность</th>
            <td mat-cell *matCellDef="let r">{{ r.efficiency | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="hasAnomaly">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="hasAnomaly">Аномалия</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [class.badge-bad]="r.hasAnomaly" [class.badge-ok]="!r.hasAnomaly">
                {{ r.hasAnomaly ? 'Да' : 'Нет' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="downtimeReason">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="downtimeReason">Причина простоя</th>
            <td mat-cell *matCellDef="let r">{{ downtimeLabel(r.downtimeReason) }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              @if (auth.isAdmin()) {
                <button mat-icon-button matTooltip="Редактировать"
                        [routerLink]="['/records/edit', r.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Удалить"
                        (click)="confirmDelete(r)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
        @if (rows().length === 0) {
          <div class="empty">Ничего не найдено</div>
        }
      </mat-card>
    } @else {
      <div class="cards">
        @for (r of rows(); track r.id) {
          <mat-card class="record-card" [class.anomaly-card]="r.hasAnomaly">
            <mat-card-header>
              <mat-card-title>{{ r.wellName }}</mat-card-title>
              <mat-card-subtitle>{{ r.fieldName }} · {{ r.productionDate | date:'dd.MM.yyyy' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="card-row"><span>Нефть</span><b>{{ r.oilVolume | number:'1.2-2' }}</b></div>
              <div class="card-row"><span>Газ</span><b>{{ r.gasVolume | number:'1.2-2' }}</b></div>
              <div class="card-row"><span>Вода</span><b>{{ r.waterVolume | number:'1.2-2' }}</b></div>
              <div class="card-row"><span>Обводнённость</span><b>{{ r.waterCut | number:'1.2-2' }}%</b></div>
              <div class="card-row"><span>Эффективность</span><b>{{ r.efficiency | number:'1.2-2' }}</b></div>
              <div class="card-row">
                <span>Аномалия</span>
                <span class="badge" [class.badge-bad]="r.hasAnomaly" [class.badge-ok]="!r.hasAnomaly">
                  {{ r.hasAnomaly ? 'Да' : 'Нет' }}
                </span>
              </div>
              <div class="card-row"><span>Причина простоя</span><b>{{ downtimeLabel(r.downtimeReason) }}</b></div>
            </mat-card-content>
            @if (auth.isAdmin()) {
              <mat-card-actions align="end">
                <button mat-button [routerLink]="['/records/edit', r.id]">Изменить</button>
                <button mat-button color="warn" (click)="confirmDelete(r)">Удалить</button>
              </mat-card-actions>
            }
          </mat-card>
        } @empty {
          <div class="empty">Ничего не найдено</div>
        }
      </div>
    }
  `,
  styles: [`
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    h1 { margin: 0 0 4px; }
    .subtitle { color: #607d8b; margin: 0; }
    .head-actions { display: flex; gap: 12px; align-items: center; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .search { width: 280px; max-width: 100%; }
    .filter { width: 200px; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .panel { padding: 8px 16px 16px; overflow-x: auto; }
    table { width: 100%; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .record-card { padding: 16px; }
    .anomaly-card { border: 2px solid #f44336; }
    .card-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px solid #eceff1;
      font-size: 14px;
    }
    .card-row:last-child { border-bottom: none; }
    .card-row span:first-child { color: #607d8b; }
    .badge {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .badge-ok { background: #e8f5e9; color: #2e7d32; }
    .badge-bad { background: #fdecea; color: #b71c1c; }
    .empty { padding: 32px; text-align: center; color: #607d8b; }
    .error-card { padding: 24px; background: #fdecea; color: #b71c1c; }
  `]
})
export class ProductionRecords implements OnInit {
  private recordService = inject(ProductionRecordService);
  private wellService = inject(WellService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  records = signal<ProductionRecord[]>([]);
  wells = signal<any[]>([]);
  search = signal('');
  wellFilter = signal<number | null>(null);
  anomalyFilter = signal<boolean | null>(null);
  sortState = signal<{ active: string; direction: string }>({ active: '', direction: '' });
  viewMode = signal<'table' | 'cards'>('table');
  loading = signal(true);
  error = signal(false);

  readonly DOWNTIME_LABELS = DOWNTIME_LABELS;

  columns = ['productionDate', 'wellName', 'fieldName', 'oilVolume', 'gasVolume', 'waterVolume', 'waterCut', 'efficiency', 'hasAnomaly', 'downtimeReason', 'actions'];

  downtimeLabel(reason: number): string {
    return DOWNTIME_LABELS[reason as DowntimeReason] ?? '—';
  }

  readonly rows = computed(() => {
    const query = this.search().toLowerCase().trim();
    let list = this.records();

    if (query) {
      list = list.filter(r =>
        r.wellName.toLowerCase().includes(query) ||
        r.fieldName.toLowerCase().includes(query)
      );
    }

    const wellId = this.wellFilter();
    if (wellId !== null) {
      list = list.filter(r => r.wellId === wellId);
    }

    const anomaly = this.anomalyFilter();
    if (anomaly !== null) {
      list = list.filter(r => r.hasAnomaly === anomaly);
    }

    const { active, direction } = this.sortState();
    if (active && direction) {
      const factor = direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const left = active === 'productionDate' ? new Date(a.productionDate).getTime() : a[active as keyof ProductionRecord];
        const right = active === 'productionDate' ? new Date(b.productionDate).getTime() : b[active as keyof ProductionRecord];
        if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
        if (typeof left === 'boolean' && typeof right === 'boolean') return ((+left) - (+right)) * factor;
        return String(left).localeCompare(String(right)) * factor;
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.load();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onSort(sort: Sort): void {
    this.sortState.set({ active: sort.active, direction: sort.direction });
  }

  confirmDelete(record: ProductionRecord): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { message: `Удалить замер от ${record.productionDate.slice(0, 10)} для скважины «${record.wellName}»? Действие необратимо.` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.recordService.delete(record.id).subscribe({
        next: () => {
          this.snackBar.open('Замер удалён.', 'Закрыть', { duration: 3000 });
          this.load();
        },
        error: err => this.snackBar.open(this.serverError(err), 'Закрыть', { duration: 6000 })
      });
    });
  }

  private load(): void {
    this.loading.set(true);
    this.recordService.getAll().subscribe({
      next: list => {
        this.records.set(list);
        this.wellService.getAll().subscribe({
          next: wells => {
            this.wells.set(wells);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  private serverError(err: any): string {
    return err.error?.error ?? err.error?.title ?? err.error?.message ?? 'Сервер отклонил запрос.';
  }
}