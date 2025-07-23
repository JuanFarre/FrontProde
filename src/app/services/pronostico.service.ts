import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pronostico } from '../models/pronostico';

@Injectable({
  providedIn: 'root'
})
export class PronosticoService {
  private apiUrl = 'http://localhost:8080/api/pronosticos'; // Ajusta la URL base según tu backend

  constructor(private http: HttpClient) {}

  getPronosticos(): Observable<Pronostico[]> {
    return this.http.get<Pronostico[]>(this.apiUrl);
  }

  crearPronostico(pronostico: Omit<Pronostico, 'id' | 'puntosObtenidos'>): Observable<Pronostico> {
    return this.http.post<Pronostico>(this.apiUrl, pronostico);
  }

  actualizarPronostico(id: number, pronostico: Partial<Pronostico>): Observable<Pronostico> {
    return this.http.put<Pronostico>(`${this.apiUrl}/${id}`, pronostico);
  }

  eliminarPronostico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
