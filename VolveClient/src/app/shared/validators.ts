import { AbstractControl, ValidationErrors } from '@angular/forms';

export function notInFuture(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return new Date(control.value) > new Date() ? { futureDate: true } : null;
}