import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { Fields } from './pages/fields';
import { FieldForm } from './pages/field-form';
import { Wells } from './pages/wells';
import { WellForm } from './pages/well-form';
import { ProductionRecords } from './pages/production-records';
import { ProductionRecordForm } from './pages/production-record-form';
import { authGuard, adminGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'fields', component: Fields, canActivate: [authGuard] },
  { path: 'fields/new', component: FieldForm, canActivate: [adminGuard] },
  { path: 'fields/edit/:id', component: FieldForm, canActivate: [adminGuard] },
  { path: 'wells', component: Wells, canActivate: [authGuard] },
  { path: 'wells/new', component: WellForm, canActivate: [adminGuard] },
  { path: 'wells/edit/:id', component: WellForm, canActivate: [adminGuard] },
  { path: 'records', component: ProductionRecords, canActivate: [authGuard] },
  { path: 'records/new', component: ProductionRecordForm, canActivate: [adminGuard] },
  { path: 'records/edit/:id', component: ProductionRecordForm, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];