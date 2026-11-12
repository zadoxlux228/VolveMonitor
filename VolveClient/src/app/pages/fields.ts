import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FieldService } from '../core/field.service';
import { AuthService } from '../core/auth.service';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { Field } from '../core/models';

@Component({
  selector: 'app-fields',
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatSortModule, MatCardModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatTooltipModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-head">
      <div>
        <h1>Месторождения</h1>
        <p class="subtitle">Найдено: {{ rows().length }} из {{ fields().length }}</p>
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
          <a mat-flat-button color="primary" routerLink="/fields/new">
            <mat-icon>add</mat-icon> Добавить
          </a>
        }
      </div>
    </div>

    <mat-form-field appearance="outline" class="search">
      <mat-label>Поиск</mat-label>
      <input matInput placeholder="Название, регион или код" (input)="onSearch($event)">
      <mat-icon matPrefix>search</mat-icon>
    </mat-form-field>

    @if (loading()) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (error()) {
      <mat-card class="error-card">Не удалось загрузить месторождения.</mat-card>
    } @else if (viewMode() === 'table') {
      <mat-card class="panel">
        <table mat-table [dataSource]="rows()" matSort (matSortChange)="onSort($event)">
          <ng-container matColumnDef="fieldCode">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="fieldCode">Код</th>
            <td mat-cell *matCellDef="let f">{{ f.fieldCode }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="name">Название</th>
            <td mat-cell *matCellDef="let f">{{ f.name }}</td>
          </ng-container>
          <ng-container matColumnDef="region">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="region">Регион</th>
            <td mat-cell *matCellDef="let f">{{ f.region }}</td>
          </ng-container>
          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="startDate">Начало разработки</th>
            <td mat-cell *matCellDef="let f">{{ f.startDate | date:'dd.MM.yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="fieldAge">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="fieldAge">Возраст, лет</th>
            <td mat-cell *matCellDef="let f">{{ f.fieldAge }}</td>
          </ng-container>
          <ng-container matColumnDef="wellCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="wellCount">Скважин</th>
            <td mat-cell *matCellDef="let f">{{ f.wellCount }}</td>
          </ng-container>
          <ng-container matColumnDef="isActive">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="isActive">Статус</th>
            <td mat-cell *matCellDef="let f">
              <span class="badge" [class.badge-off]="!f.isActive">
                {{ f.isActive ? 'Активно' : 'Неактивно' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let f">
              @if (auth.isAdmin()) {
                <button mat-icon-button matTooltip="Редактировать"
                        [routerLink]="['/fields/edit', f.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Удалить"
                        (click)="confirmDelete(f)">
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
        @for (f of rows(); track f.id) {
          <mat-card class="field-card">
            <mat-card-header>
              <mat-card-title>{{ f.name }}</mat-card-title>
              <mat-card-subtitle>{{ f.fieldCode }} · {{ f.region }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="card-row"><span>Начало разработки</span><b>{{ f.startDate | date:'dd.MM.yyyy' }}</b></div>
              <div class="card-row"><span>Возраст</span><b>{{ f.fieldAge }} лет</b></div>
              <div class="card-row"><span>Скважин</span><b>{{ f.wellCount }}</b></div>
              <div class="card-row">
                <span>Статус</span>
                <span class="badge" [class.badge-off]="!f.isActive">
                  {{ f.isActive ? 'Активно' : 'Неактивно' }}
                </span>
              </div>
            </mat-card-content>
            @if (auth.isAdmin()) {
              <mat-card-actions align="end">
                <button mat-button [routerLink]="['/fields/edit', f.id]">Изменить</button>
                <button mat-button color="warn" (click)="confirmDelete(f)">Удалить</button>
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
    .search { width: 320px; max-width: 100%; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .panel { padding: 8px 16px 16px; overflow-x: auto; }
    table { width: 100%; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .field-card { padding: 16px; }
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
      background: #e8f5e9;
      color: #2e7d32;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .badge-off { background: #eceff1; color: #607d8b; }
    .empty { padding: 32px; text-align: center; color: #607d8b; }
    .error-card { padding: 24px; background: #fdecea; color: #b71c1c; }
  `]
})
export class Fields implements OnInit {
  private fieldService = inject(FieldService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  fields = signal<Field[]>([]);
  search = signal('');
  sortState = signal<{ active: string; direction: string }>({ active: '', direction: '' });
  viewMode = signal<'table' | 'cards'>('table');
  loading = signal(true);
  error = signal(false);

  columns = ['fieldCode', 'name', 'region', 'startDate', 'fieldAge', 'wellCount', 'isActive', 'actions'];

  readonly rows = computed(() => {
    const query = this.search().toLowerCase().trim();
    let list = this.fields();

    if (query) {
      list = list.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.region.toLowerCase().includes(query) ||
        f.fieldCode.toLowerCase().includes(query)
      );
    }

    const { active, direction } = this.sortState();
    if (active && direction) {
      const factor = direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const left = active === 'startDate' ? new Date(a.startDate).getTime() : a[active as keyof Field];
        const right = active === 'startDate' ? new Date(b.startDate).getTime() : b[active as keyof Field];
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

  confirmDelete(field: Field): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { message: `Удалить месторождение «${field.name}»? Действие необратимо.` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.fieldService.delete(field.id).subscribe({
        next: () => {
          this.snackBar.open('Месторождение удалено.', 'Закрыть', { duration: 3000 });
          this.load();
        },
        error: err => this.snackBar.open(this.serverError(err), 'Закрыть', { duration: 6000 })
      });
    });
  }

  private load(): void {
    this.loading.set(true);
    this.fieldService.getAll().subscribe({
      next: list => {
        this.fields.set(list);
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