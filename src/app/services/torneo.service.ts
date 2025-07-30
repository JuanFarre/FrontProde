import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Torneo } from '../models/torneo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private apiUrl = `${environment.apiUrl}/torneos`; // Cambia la URL según tu backend

  constructor(private http: HttpClient) { }

  getTorneos(): Observable<Torneo[]> {
    return this.http.get<Torneo[]>(this.apiUrl);
  }

  getTorneo(id: number): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.apiUrl}/${id}`);
  }

  crearTorneo(torneo: Torneo): Observable<Torneo> {
    return this.http.post<Torneo>(this.apiUrl, torneo);
  }

  actualizarTorneo(id: number, torneo: Torneo): Observable<Torneo> {
    return this.http.put<Torneo>(`${this.apiUrl}/${id}`, torneo);
  }

  eliminarTorneo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}