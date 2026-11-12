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
import { WellService } from '../core/well.service';
import { AuthService } from '../core/auth.service';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { WELL_STATUS_LABELS, Well, WellStatus } from '../core/models';

@Component({
  selector: 'app-wells',
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
        <h1>Скважины</h1>
        <p class="subtitle">Найдено: {{ rows().length }} из {{ wells().length }}</p>
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
          <a mat-flat-button color="primary" routerLink="/wells/new">
            <mat-icon>add</mat-icon> Добавить
          </a>
        }
      </div>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search">
        <mat-label>Поиск</mat-label>
        <input matInput placeholder="15/9-F-1 C" (input)="onSearch($event)">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter">
        <mat-label>Тип</mat-label>
        <mat-select [value]="typeFilter()" (selectionChange)="typeFilter.set($event.value)">
          <mat-option value="">Все</mat-option>
          <mat-option value="OP">Добывающие</mat-option>
          <mat-option value="WI">Нагнетательные</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter">
        <mat-label>Статус</mat-label>
        <mat-select [value]="statusFilter()" (selectionChange)="statusFilter.set($event.value)">
          <mat-option [value]="null">Все</mat-option>
          @for (s of statusOptions; track s) {
            <mat-option [value]="s">{{ WELL_STATUS_LABELS[s] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (error()) {
      <mat-card class="error-card">Не удалось загрузить скважины.</mat-card>
    } @else if (viewMode() === 'table') {
      <mat-card class="panel">
        <table mat-table [dataSource]="rows()" matSort (matSortChange)="onSort($event)">
          <ng-container matColumnDef="wellCode">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="wellCode">Код</th>
            <td mat-cell *matCellDef="let w">{{ w.wellCode }}</td>
          </ng-container>
          <ng-container matColumnDef="wellName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="wellName">Название</th>
            <td mat-cell *matCellDef="let w">{{ w.wellName }}</td>
          </ng-container>
          <ng-container matColumnDef="wellType">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="wellType">Тип</th>
            <td mat-cell *matCellDef="let w">
              <span class="type-badge" [class.type-wi]="w.wellType === 'WI'">
                {{ w.wellType === 'OP' ? 'Добывающая' : 'Нагнетательная' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="fieldName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="fieldName">Месторождение</th>
            <td mat-cell *matCellDef="let w">{{ w.fieldName }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="status">Статус</th>
            <td mat-cell *matCellDef="let w">
              <span class="badge" [class]="statusClass(w.status)">
                {{ statusLabel(w.status) }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="operationalYears">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="operationalYears">Возраст, лет</th>
            <td mat-cell *matCellDef="let w">{{ w.operationalYears | number:'1.0-0' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let w">
              @if (auth.isAdmin()) {
                <button mat-icon-button matTooltip="Редактировать"
                        [routerLink]="['/wells/edit', w.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Удалить"
                        (click)="confirmDelete(w)">
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
        @for (w of rows(); track w.id) {
          <mat-card class="well-card">
            <mat-card-header>
              <mat-card-title>{{ w.wellName }}</mat-card-title>
              <mat-card-subtitle>{{ w.wellCode }} · {{ w.fieldName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="card-row">
                <span>Тип</span>
                <span class="type-badge" [class.type-wi]="w.wellType === 'WI'">
                  {{ w.wellType === 'OP' ? 'Добывающая' : 'Нагнетательная' }}
                </span>
              </div>
              <div class="card-row">
                <span>Статус</span>
                <span class="badge" [class]="statusClass(w.status)">
                  {{ statusLabel(w.status) }}
                </span>
              </div>
              <div class="card-row"><span>Возраст</span><b>{{ w.operationalYears | number:'1.0-0' }} лет</b></div>
              <div class="card-row"><span>Добывает нефть</span><b>{{ w.isProducer ? 'Да' : 'Нет' }}</b></div>
              <div class="card-row"><span>Объект</span><b>{{ w.facilityName || '—' }}</b></div>
            </mat-card-content>
            @if (auth.isAdmin()) {
              <mat-card-actions align="end">
                <button mat-button [routerLink]="['/wells/edit', w.id]">Изменить</button>
                <button mat-button color="warn" (click)="confirmDelete(w)">Удалить</button>
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
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .well-card { padding: 16px; }
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
    .type-badge {
      background: #e3f0fa;
      color: #0d47a1;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .type-wi { background: #fff3e0; color: #e65100; }
    .badge {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .badge-ok { background: #e8f5e9; color: #2e7d32; }
    .badge-warn { background: #fff8e1; color: #f57f17; }
    .badge-bad { background: #fdecea; color: #b71c1c; }
    .empty { padding: 32px; text-align: center; color: #607d8b; }
    .error-card { padding: 24px; background: #fdecea; color: #b71c1c; }
  `]
})
export class Wells implements OnInit {
  private wellService = inject(WellService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  wells = signal<Well[]>([]);
  search = signal('');
  typeFilter = signal('');
  statusFilter = signal<WellStatus | null>(null);
  sortState = signal<{ active: string; direction: string }>({ active: '', direction: '' });
  viewMode = signal<'table' | 'cards'>('table');
  loading = signal(true);
  error = signal(false);

  readonly statusOptions = [
    WellStatus.Active,
    WellStatus.ShutIn,
    WellStatus.UnderRepair,
    WellStatus.Conserved,
    WellStatus.Abandoned
  ];
  readonly WELL_STATUS_LABELS = WELL_STATUS_LABELS;

  columns = ['wellCode', 'wellName', 'wellType', 'fieldName', 'status', 'operationalYears', 'actions'];

  readonly rows = computed(() => {
    const query = this.search().toLowerCase().trim();
    let list = this.wells();

    if (query) {
      list = list.filter(w =>
        w.wellCode.toLowerCase().includes(query) ||
        w.wellName.toLowerCase().includes(query) ||
        w.fieldName.toLowerCase().includes(query)
      );
    }

    if (this.typeFilter()) {
      list = list.filter(w => w.wellType === this.typeFilter());
    }

    const status = this.statusFilter();
    if (status !== null) {
      list = list.filter(w => w.status === status);
    }

    const { active, direction } = this.sortState();
    if (active && direction) {
      const factor = direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const left = a[active as keyof Well];
        const right = b[active as keyof Well];
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

  statusLabel(status: WellStatus): string {
    return WELL_STATUS_LABELS[status];
  }

  statusClass(status: WellStatus): string {
    if (status === WellStatus.Active) return 'badge-ok';
    if (status === WellStatus.Abandoned) return 'badge-bad';
    return 'badge-warn';
  }

  confirmDelete(well: Well): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { message: `Удалить скважину «${well.wellName}»? Действие необратимо.` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.wellService.delete(well.id).subscribe({
        next: () => {
          this.snackBar.open('Скважина удалена.', 'Закрыть', { duration: 3000 });
          this.load();
        },
        error: err => this.snackBar.open(this.serverError(err), 'Закрыть', { duration: 6000 })
      });
    });
  }

  private load(): void {
    this.loading.set(true);
    this.wellService.getAll().subscribe({
      next: list => {
        this.wells.set(list);
        this.loading.set(false);
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