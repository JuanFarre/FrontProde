import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partido } from '../models/partido';

@Injectable({
  providedIn: 'root'
})
export class PartidoService {
  private apiUrl = 'http://localhost:8080/api/partidos'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  getPartidos(): Observable<Partido[]> {
    return this.http.get<Partido[]>(this.apiUrl);
  }

  crearPartido(partido: Partido): Observable<Partido> {
    return this.http.post<Partido>(this.apiUrl, partido);
  }

  actualizarPartido(id: number, partido: Partido): Observable<Partido> {
    return this.http.put<Partido>(`${this.apiUrl}/${id}`, partido);
  }

  eliminarPartido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Método para recalcular tickets afectados por cambios en un partido
  recalcularTickets(partidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/recalcular-tickets`, {});
  }
}