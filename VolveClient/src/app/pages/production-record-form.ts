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
import { ProductionRecordService } from '../core/production-record.service';
import { WellService } from '../core/well.service';
import { notInFuture } from '../shared/validators';
import { CreateProductionRecordDto, DOWNTIME_LABELS, DowntimeReason, UpdateProductionRecordDto, Well } from '../core/models';

@Component({
  selector: 'app-production-record-form',
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
          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (isEdit()) {
              <div class="info-row">
                <mat-form-field appearance="outline">
                  <mat-label>Дата замера</mat-label>
                  <input matInput [value]="productionDateDisplay()" disabled>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Скважина</mat-label>
                  <input matInput [value]="wellNameDisplay()" disabled>
                </mat-form-field>
              </div>
              <p class="note">Дата и скважина не изменяются при редактировании.</p>
            } @else {
              <div class="section">Дата и скважина</div>

              <mat-form-field appearance="outline">
                <mat-label>Дата замера</mat-label>
                <input matInput type="date" formControlName="productionDate">
                @if (form.controls.productionDate.hasError('required')) {
                  <mat-error>Укажите дату</mat-error>
                }
                @if (form.controls.productionDate.hasError('futureDate')) {
                  <mat-error>Дата не может быть в будущем</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Скважина</mat-label>
                <mat-select formControlName="wellId" (selectionChange)="onWellChange($event.value)">
                  @for (w of wells(); track w.id) {
                    <mat-option [value]="w.id">{{ w.wellName }} ({{ w.wellCode }})</mat-option>
                  }
                </mat-select>
                @if (form.controls.wellId.hasError('required') || form.controls.wellId.hasError('min')) {
                  <mat-error>Выберите скважину</mat-error>
                }
              </mat-form-field>
            }

            <div class="section">Режим работы и датчики</div>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Часы работы</mat-label>
                <input matInput type="number" formControlName="onStreamHours" placeholder="24">
                <mat-hint>Меньше 24 — укажите простой</mat-hint>
                @if (form.controls.onStreamHours.hasError('required')) {
                  <mat-error>Укажите часы</mat-error>
                }
                @if (form.controls.onStreamHours.hasError('min') || form.controls.onStreamHours.hasError('max')) {
                  <mat-error>От 0 до 24</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Давление, bar</mat-label>
                <input matInput type="number" formControlName="downholePressure" placeholder="250">
                @if (form.controls.downholePressure.hasError('min') || form.controls.downholePressure.hasError('max')) {
                  <mat-error>От 0 до 500</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Температура, °C</mat-label>
                <input matInput type="number" formControlName="downholeTemperature" placeholder="95">
                @if (form.controls.downholeTemperature.hasError('min') || form.controls.downholeTemperature.hasError('max')) {
                  <mat-error>От -20 до 200</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="section">Объёмы за сутки</div>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Нефть</mat-label>
                <input matInput type="number" formControlName="oilVolume" placeholder="100">
                @if (form.controls.oilVolume.hasError('required')) {
                  <mat-error>Укажите объём</mat-error>
                }
                @if (form.controls.oilVolume.hasError('min')) {
                  <mat-error>Не может быть отрицательным</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Газ</mat-label>
                <input matInput type="number" formControlName="gasVolume" placeholder="300">
                @if (form.controls.gasVolume.hasError('required')) {
                  <mat-error>Укажите объём</mat-error>
                }
                @if (form.controls.gasVolume.hasError('min')) {
                  <mat-error>Не может быть отрицательным</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Вода</mat-label>
                <input matInput type="number" formControlName="waterVolume" placeholder="50">
                @if (form.controls.waterVolume.hasError('required')) {
                  <mat-error>Укажите объём</mat-error>
                }
                @if (form.controls.waterVolume.hasError('min')) {
                  <mat-error>Не может быть отрицательным</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Объём закачки воды</mat-label>
              <input matInput type="number" formControlName="waterInjectionVolume" placeholder="0">
              @if (form.controls.waterInjectionVolume.hasError('required')) {
                <mat-error>Укажите объём</mat-error>
              }
              @if (form.controls.waterInjectionVolume.hasError('min')) {
                <mat-error>Не может быть отрицательным</mat-error>
              }
            </mat-form-field>

            <div class="section">Простой</div>

            <mat-form-field appearance="outline">
              <mat-label>Причина простоя</mat-label>
              <mat-select formControlName="downtimeReason">
                @for (reason of downtimeReasons; track reason) {
                  <mat-option [value]="reason">{{ DOWNTIME_LABELS[reason] }}</mat-option>
                }
              </mat-select>
              <mat-hint>При 24 часах работы простоя нет — поле блокируется автоматически</mat-hint>
            </mat-form-field>

            @if (wiWarning()) {
              <p class="wi-warning">{{ wiWarning() }}</p>
            }

            @if (errorMessage()) {
              <div class="server-error">{{ errorMessage() }}</div>
            }

            <div class="actions">
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || saving()">
                Сохранить
              </button>
              <a mat-button routerLink="/records">Отмена</a>
            </div>
          </form>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrap { max-width: 760px; }
    h1 { margin: 0 0 16px; }
    .form-card { padding: 28px; }
    mat-form-field { width: 100%; padding-bottom: 22px; }
    .row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 16px;
    }
    .info-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
    }
    .section {
      margin: 4px 0 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #607d8b;
    }
    .center { display: flex; justify-content: center; padding: 32px; }
    .actions { display: flex; gap: 12px; margin-top: 4px; }
    .note {
      background: #e3f0fa;
      color: #0d2b45;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 0 0 16px;
      font-size: 14px;
    }
    .wi-warning {
      background: #fff3e0;
      color: #e65100;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 0 0 12px;
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
    @media (max-width: 640px) {
      .form-card { padding: 20px; }
      .row, .info-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductionRecordForm implements OnInit {
  private fb = inject(FormBuilder);
  private recordService = inject(ProductionRecordService);
  private wellService = inject(WellService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  title = signal('Новый замер добычи');
  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  wells = signal<Well[]>([]);
  wiWarning = signal('');
  productionDateDisplay = signal('');
  wellNameDisplay = signal('');
  private editId: number | null = null;
  private selectedWellType: string = '';

  readonly downtimeReasons = [
    DowntimeReason.None,
    DowntimeReason.PlannedMaintenance,
    DowntimeReason.EquipmentFailure,
    DowntimeReason.PowerOutage,
    DowntimeReason.WellWorkover,
    DowntimeReason.Other
  ];
  readonly DOWNTIME_LABELS = DOWNTIME_LABELS;

  form = this.fb.nonNullable.group({
    productionDate: ['', [Validators.required, notInFuture]],
    onStreamHours: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    downholePressure: [null as number | null, [Validators.min(0), Validators.max(500)]],
    downholeTemperature: [null as number | null, [Validators.min(-20), Validators.max(200)]],
    oilVolume: [0, [Validators.required, Validators.min(0)]],
    gasVolume: [0, [Validators.required, Validators.min(0)]],
    waterVolume: [0, [Validators.required, Validators.min(0)]],
    waterInjectionVolume: [0, [Validators.required, Validators.min(0)]],
    wellId: [0, [Validators.required, Validators.min(1)]],
    downtimeReason: [DowntimeReason.None, Validators.required]
  });

  ngOnInit(): void {
    this.form.controls.onStreamHours.valueChanges.subscribe(hours => this.syncDowntime(hours));

    this.wellService.getAll().subscribe({
      next: list => {
        this.wells.set(list);
        this.loadRecordIfEdit();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Не удалось загрузить список скважин.');
      }
    });
  }

  onWellChange(wellId: number): void {
    const well = this.wells().find(w => w.id === wellId);
    if (well) {
      this.selectedWellType = well.wellType;
      this.checkWiRules();
    }
  }

  private syncDowntime(hours: number): void {
    if (hours === 24) {
      this.form.controls.downtimeReason.setValue(DowntimeReason.None);
      this.form.controls.downtimeReason.disable();
    } else {
      this.form.controls.downtimeReason.enable();
    }
  }

  private checkWiRules(): void {
    if (this.selectedWellType === 'WI') {
      this.wiWarning.set('Нагнетательная скважина: нефть должна быть 0, вода > 0.');
      this.form.controls.oilVolume.setValue(0);
      this.form.controls.oilVolume.disable();
      if (this.form.controls.waterVolume.value === 0) {
        this.form.controls.waterVolume.setValue(1);
      }
    } else {
      this.wiWarning.set('');
      this.form.controls.oilVolume.enable();
    }
  }

  private loadRecordIfEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.editId = Number(id);
    this.isEdit.set(true);
    this.title.set('Редактирование замера');

    this.recordService.getById(this.editId).subscribe({
      next: record => {
        this.productionDateDisplay.set(record.productionDate.slice(0, 10));
        this.wellNameDisplay.set(record.wellName);
        this.selectedWellType = this.wells().find(w => w.id === record.wellId)?.wellType ?? '';

        this.form.patchValue({
          onStreamHours: record.onStreamHours,
          downholePressure: record.downholePressure,
          downholeTemperature: record.downholeTemperature,
          oilVolume: record.oilVolume,
          gasVolume: record.gasVolume,
          waterVolume: record.waterVolume,
          waterInjectionVolume: record.waterInjectionVolume,
          downtimeReason: record.downtimeReason
        });

        this.form.controls.productionDate.disable();
        this.form.controls.wellId.disable();

        this.checkWiRules();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Замер не найден.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    if (this.editId === null) {
      const dto: CreateProductionRecordDto = {
        productionDate: raw.productionDate.includes('T')
          ? raw.productionDate
          : raw.productionDate + 'T00:00:00Z',
        onStreamHours: raw.onStreamHours,
        downholePressure: raw.downholePressure ?? undefined,
        downholeTemperature: raw.downholeTemperature ?? undefined,
        oilVolume: raw.oilVolume,
        gasVolume: raw.gasVolume,
        waterVolume: raw.waterVolume,
        waterInjectionVolume: raw.waterInjectionVolume,
        wellId: raw.wellId,
        downtimeReason: raw.downtimeReason
      };

      this.saving.set(true);
      this.errorMessage.set('');

      this.recordService.create(dto).subscribe({
        next: () => this.router.navigate(['/records']),
        error: err => {
          this.saving.set(false);
          this.errorMessage.set(this.serverError(err));
        }
      });
    } else {
      const dto: UpdateProductionRecordDto = {
        onStreamHours: raw.onStreamHours,
        downholePressure: raw.downholePressure ?? undefined,
        downholeTemperature: raw.downholeTemperature ?? undefined,
        oilVolume: raw.oilVolume,
        gasVolume: raw.gasVolume,
        waterVolume: raw.waterVolume,
        waterInjectionVolume: raw.waterInjectionVolume,
        downtimeReason: raw.downtimeReason
      };

      this.saving.set(true);
      this.errorMessage.set('');

      const request: Observable<unknown> = this.recordService.update(this.editId, dto);

      request.subscribe({
        next: () => this.router.navigate(['/records']),
        error: err => {
          this.saving.set(false);
          this.errorMessage.set(this.serverError(err));
        }
      });
    }
  }

  private serverError(err: any): string {
    return err.error?.error ?? err.error?.title ?? err.error?.message ?? 'Сервер отклонил запрос.';
  }
}