import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fecha } from '../models/fecha';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FechaService {
  private apiUrl = `${environment.apiUrl}/fechas`;

  constructor(private http: HttpClient) {}

  getFechas(): Observable<Fecha[]> {
    return this.http.get<Fecha[]>(this.apiUrl);
  }

  getFecha(id: number): Observable<Fecha> {
    return this.http.get<Fecha>(`${this.apiUrl}/${id}`);
  }

// Cambia el tipo de los parámetros:
crearFecha(fechaDto: { nombre: string, torneoId: number }): Observable<Fecha> {
  return this.http.post<Fecha>(this.apiUrl, fechaDto);
}

actualizarFecha(id: number, fechaDto: { nombre: string, torneoId: number }): Observable<Fecha> {
  return this.http.put<Fecha>(`${this.apiUrl}/${id}`, fechaDto);
}

  eliminarFecha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}