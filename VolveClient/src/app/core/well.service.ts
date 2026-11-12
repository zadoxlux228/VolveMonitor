import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api';
import { SaveWellDto, Well } from './models';

@Injectable({ providedIn: 'root' })
export class WellService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Well[]>(`${API_URL}/Wells`);
  }

  getById(id: number) {
    return this.http.get<Well>(`${API_URL}/Wells/${id}`);
  }

  create(dto: SaveWellDto) {
    return this.http.post<Well>(`${API_URL}/Wells`, dto);
  }

  update(id: number, dto: SaveWellDto) {
    return this.http.put<void>(`${API_URL}/Wells/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${API_URL}/Wells/${id}`);
  }
}