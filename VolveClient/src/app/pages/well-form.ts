import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WellService } from '../core/well.service';
import { FieldService } from '../core/field.service';
import { notInFuture } from '../shared/validators';
import { Field, SaveWellDto, WELL_STATUS_LABELS, WellStatus } from '../core/models';

@Component({
  selector: 'app-well-form',
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="form-wrap">
      <h1>{{ title() }}</h1>

      <mat-card class="form-card">
        @if (loading()) {
          <div class="center"><mat-spinner></mat-spinner></div>
        } @else {
          @if (isEdit()) {
            <p class="note-info">
              Код, дата начала добычи и месторождение не изменяются при редактировании.
            </p>
          }

          @if (abandonedLocked()) {
            <p class="note-warn">
              Скважина ликвидирована: статус изменить нельзя.
            </p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Код скважины</mat-label>
              <input matInput formControlName="wellCode" placeholder="15/9-F-1 C">
              @if (form.controls.wellCode.hasError('required')) {
                <mat-error>Введите код скважины</mat-error>
              }
              @if (form.controls.wellCode.hasError('maxlength')) {
                <mat-error>Не длиннее 50 символов</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Название</mat-label>
              <input matInput formControlName="wellName" placeholder="Volve Well">
              @if (form.controls.wellName.hasError('required')) {
                <mat-error>Введите название</mat-error>
              }
              @if (form.controls.wellName.hasError('maxlength')) {
                <mat-error>Не длиннее 100 символов</mat-error>
              }
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline" class="half">
                <mat-label>Тип</mat-label>
                <mat-select formControlName="wellType">
                  <mat-option value="OP">Добывающая (OP)</mat-option>
                  <mat-option value="WI">Нагнетательная (WI)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half">
                <mat-label>Статус</mat-label>
                <mat-select formControlName="status">
                  @for (s of statusOptions; track s) {
                    <mat-option [value]="s">{{ WELL_STATUS_LABELS[s] }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Объект (необязательно)</mat-label>
              <input matInput formControlName="facilityName" placeholder="Volve">
              @if (form.controls.facilityName.hasError('maxlength')) {
                <mat-error>Не длиннее 100 символов</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Месторождение</mat-label>
              <mat-select formControlName="fieldId">
                @for (f of fields(); track f.id) {
                  <mat-option [value]="f.id">{{ f.name }}</mat-option>
                }
              </mat-select>
              @if (form.controls.fieldId.hasError('required') || form.controls.fieldId.hasError('min')) {
                <mat-error>Выберите месторождение</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Дата начала добычи</mat-label>
              <input matInput type="date" formControlName="firstProductionDate">
              @if (form.controls.firstProductionDate.hasError('required')) {
                <mat-error>Укажите дату</mat-error>
              }
              @if (form.controls.firstProductionDate.hasError('futureDate')) {
                <mat-error>Дата не может быть в будущем</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="server-error">{{ errorMessage() }}</div>
            }

            <div class="actions">
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || saving()">
                Сохранить
              </button>
              <a mat-button routerLink="/wells">Отмена</a>
            </div>
          </form>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrap { max-width: 640px; }
    h1 { margin: 0 0 16px; }
    .form-card { padding: 24px; }
    .full { width: 100%; margin-bottom: 8px; }
    .row { display: flex; gap: 16px; }
    .half { flex: 1; margin-bottom: 8px; }
    .center { display: flex; justify-content: center; padding: 32px; }
    .actions { display: flex; gap: 12px; margin-top: 8px; }
    .note-info {
      background: #e3f0fa;
      color: #0d2b45;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 0 0 16px;
      font-size: 14px;
    }
    .note-warn {
      background: #fdecea;
      color: #b71c1c;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 0 0 16px;
      font-size: 14px;
    }
    .server-error {
      background: #fdecea;
      color: #b71c1c;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
      font-size: 14px;
    }
  `]
})
export class WellForm implements OnInit {
  private fb = inject(FormBuilder);
  private wellService = inject(WellService);
  private fieldService = inject(FieldService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  title = signal('Новая скважина');
  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  abandonedLocked = signal(false);
  fields = signal<Field[]>([]);
  private editId: number | null = null;

  readonly statusOptions = [
    WellStatus.Active,
    WellStatus.ShutIn,
    WellStatus.UnderRepair,
    WellStatus.Conserved,
    WellStatus.Abandoned
  ];
  readonly WELL_STATUS_LABELS = WELL_STATUS_LABELS;

  form = this.fb.nonNullable.group({
    wellCode: ['', [Validators.required, Validators.maxLength(50)]],
    wellName: ['', [Validators.required, Validators.maxLength(100)]],
    wellType: ['OP', Validators.required],
    facilityName: ['', Validators.maxLength(100)],
    firstProductionDate: ['', [Validators.required, notInFuture]],
    fieldId: [0, [Validators.required, Validators.min(1)]],
    status: [WellStatus.Active, Validators.required]
  });

  ngOnInit(): void {
    this.fieldService.getAll().subscribe({
      next: list => {
        this.fields.set(list);
        this.loadWellIfEdit();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Не удалось загрузить список месторождений.');
      }
    });
  }

  private loadWellIfEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.editId = Number(id);
    this.isEdit.set(true);
    this.title.set('Редактирование скважины');

    this.wellService.getById(this.editId).subscribe({
      next: well => {
        this.form.patchValue({
          wellCode: well.wellCode,
          wellName: well.wellName,
          wellType: well.wellType,
          facilityName: well.facilityName ?? '',
          firstProductionDate: well.firstProductionDate.slice(0, 10),
          fieldId: well.fieldId,
          status: well.status
        });

        this.form.controls.wellCode.disable();
        this.form.controls.firstProductionDate.disable();
        this.form.controls.fieldId.disable();

        if (well.status === WellStatus.Abandoned) {
          this.form.controls.status.disable();
          this.abandonedLocked.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Скважина не найдена.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: SaveWellDto = {
      wellCode: raw.wellCode.trim(),
      wellName: raw.wellName.trim(),
      wellType: raw.wellType,
      firstProductionDate: raw.firstProductionDate.includes('T')
        ? raw.firstProductionDate
        : raw.firstProductionDate + 'T00:00:00Z',
      fieldId: raw.fieldId,
      status: raw.status
    };
    if (raw.facilityName.trim()) {
      dto.facilityName = raw.facilityName.trim();
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const request: Observable<unknown> = this.editId === null
      ? this.wellService.create(dto)
      : this.wellService.update(this.editId, dto);

    request.subscribe({
      next: () => this.router.navigate(['/wells']),
      error: err => {
        this.saving.set(false);
        this.errorMessage.set(this.serverError(err));
      }
    });
  }

  private serverError(err: any): string {
    return err.error?.error ?? err.error?.title ?? err.error?.message ?? 'Сервер отклонил запрос.';
  }
}