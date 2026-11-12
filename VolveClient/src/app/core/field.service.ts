import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api';
import { CreateFieldDto, Field, UpdateFieldDto } from './models';

@Injectable({ providedIn: 'root' })
export class FieldService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Field[]>(`${API_URL}/Fields`);
  }

  getById(id: number) {
    return this.http.get<Field>(`${API_URL}/Fields/${id}`);
  }

  create(dto: CreateFieldDto) {
    return this.http.post<Field>(`${API_URL}/Fields`, dto);
  }

  update(id: number, dto: UpdateFieldDto) {
    return this.http.put<void>(`${API_URL}/Fields/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${API_URL}/Fields/${id}`);
  }
}