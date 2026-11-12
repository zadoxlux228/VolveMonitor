import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-wrap">
      <mat-card class="login-card">
        <h1 class="login-title">Вход в систему</h1>
        <p class="login-subtitle">VolveMonitor — управление нефтедобычей</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Имя пользователя</mat-label>
            <input matInput formControlName="username" autocomplete="username">
            <mat-icon matPrefix>person</mat-icon>
            @if (form.controls.username.hasError('required')) {
              <mat-error>Введите имя пользователя</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Пароль</mat-label>
            <input matInput [type]="hide ? 'password' : 'text'"
                   formControlName="password" autocomplete="current-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
              <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.hasError('required')) {
              <mat-error>Введите пароль</mat-error>
            }
            @if (form.controls.password.hasError('minlength')) {
              <mat-error>Минимум 6 символов</mat-error>
            }
          </mat-form-field>

          @if (errorMessage) {
            <div class="server-error">{{ errorMessage }}</div>
          }

          <button mat-flat-button color="primary" class="full submit"
                  type="submit" [disabled]="form.invalid || loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Войти
            }
          </button>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .login-card { max-width: 420px; width: 100%; padding: 32px; }
    .login-title { margin: 0 0 4px; font-size: 24px; }
    .login-subtitle { margin: 0 0 24px; color: #607d8b; }
    .full { width: 100%; }
    mat-form-field { margin-bottom: 8px; }
    .submit { height: 48px; margin-top: 8px; }
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
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hide = true;
  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading = false;
        this.errorMessage =
          err.error?.error ??
          err.error?.message ??
          (err.status === 401
            ? 'Неверное имя пользователя или пароль.'
            : 'Сервер недоступен. Проверьте, что VolveApi запущен.');
      }
    });
  }
}