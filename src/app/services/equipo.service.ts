// src/app/services/equipo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo } from '../models/equipo'; // Asegúrate de que la ruta sea correcta
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private baseUrl = `${environment.apiUrl}/equipos`; // Asegúrate que esta URL sea correcta

  constructor(private http: HttpClient) {}

  // Obtener todos los equipos
  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.baseUrl);
  }

  // Obtener un equipo por ID
  getEquipoById(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo equipo
  crearEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(`${this.baseUrl}/crear`, equipo);
  }

  // Editar un equipo existente
  actualizarEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.baseUrl}/editar/${id}`, equipo);
  }

  // Eliminar un equipo
  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
