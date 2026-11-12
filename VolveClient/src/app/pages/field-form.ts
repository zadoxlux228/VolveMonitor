import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FieldService } from '../core/field.service';
import { notInFuture } from '../shared/validators';

@Component({
  selector: 'app-field-form',
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
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
            <p class="note">
              Код месторождения и дата начала разработки
              не изменяются при редактировании.
            </p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Код месторождения</mat-label>
              <input matInput formControlName="fieldCode" placeholder="3420717">
              @if (form.controls.fieldCode.hasError('required')) {
                <mat-error>Введите код месторождения</mat-error>
              }
              @if (form.controls.fieldCode.hasError('maxlength')) {
                <mat-error>Не длиннее 50 символов</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Название</mat-label>
              <input matInput formControlName="name" placeholder="Volve">
              @if (form.controls.name.hasError('required')) {
                <mat-error>Введите название</mat-error>
              }
              @if (form.controls.name.hasError('maxlength')) {
                <mat-error>Не длиннее 100 символов</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Регион</mat-label>
              <input matInput formControlName="region" placeholder="North Sea">
              @if (form.controls.region.hasError('required')) {
                <mat-error>Введите регион</mat-error>
              }
              @if (form.controls.region.hasError('maxlength')) {
                <mat-error>Не длиннее 100 символов</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Дата начала разработки</mat-label>
              <input matInput type="date" formControlName="startDate">
              @if (form.controls.startDate.hasError('required')) {
                <mat-error>Укажите дату</mat-error>
              }
              @if (form.controls.startDate.hasError('futureDate')) {
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
              <a mat-button routerLink="/fields">Отмена</a>
            </div>
          </form>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrap { max-width: 560px; }
    h1 { margin: 0 0 16px; }
    .form-card { padding: 24px; }
    .full { width: 100%; margin-bottom: 8px; }
    .center { display: flex; justify-content: center; padding: 32px; }
    .actions { display: flex; gap: 12px; margin-top: 8px; }
    .note {
      background: #e3f0fa;
      color: #0d2b45;
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
export class FieldForm implements OnInit {
  private fb = inject(FormBuilder);
  private fieldService = inject(FieldService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  title = signal('Новое месторождение');
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  private editId: number | null = null;

  form = this.fb.nonNullable.group({
    fieldCode: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    region: ['', [Validators.required, Validators.maxLength(100)]],
    startDate: ['', [Validators.required, notInFuture]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editId = Number(id);
    this.isEdit.set(true);
    this.title.set('Редактирование месторождения');
    this.loading.set(true);

    this.fieldService.getById(this.editId).subscribe({
      next: field => {
        this.form.patchValue({
          fieldCode: field.fieldCode,
          name: field.name,
          region: field.region,
          startDate: field.startDate.slice(0, 10)
        });
        this.form.controls.fieldCode.disable();
        this.form.controls.startDate.disable();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Месторождение не найдено.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set('');

    if (this.editId === null) {
      const dto = {
        fieldCode: raw.fieldCode,
        name: raw.name,
        region: raw.region,
        startDate: raw.startDate.includes('T') ? raw.startDate : raw.startDate + 'T00:00:00Z'
      };
      this.fieldService.create(dto).subscribe({
        next: () => this.router.navigate(['/fields']),
        error: err => {
          this.saving.set(false);
          this.errorMessage.set(this.serverError(err));
        }
      });
    } else {
      const dto = { name: raw.name, region: raw.region };
      this.fieldService.update(this.editId, dto).subscribe({
        next: () => this.router.navigate(['/fields']),
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