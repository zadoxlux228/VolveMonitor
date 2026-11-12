import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api';
import { CreateProductionRecordDto, ProductionRecord, UpdateProductionRecordDto } from './models';

@Injectable({ providedIn: 'root' })
export class ProductionRecordService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<ProductionRecord[]>(`${API_URL}/ProductionRecords`);
  }

  getById(id: number) {
    return this.http.get<ProductionRecord>(`${API_URL}/ProductionRecords/${id}`);
  }

  create(dto: CreateProductionRecordDto) {
    return this.http.post<ProductionRecord>(`${API_URL}/ProductionRecords`, dto);
  }

  update(id: number, dto: UpdateProductionRecordDto) {
    return this.http.put<void>(`${API_URL}/ProductionRecords/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${API_URL}/ProductionRecords/${id}`);
  }
}