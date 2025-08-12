import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, forkJoin, mergeMap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TicketService } from './ticket.service';
import { UsuarioService } from './usuario.service';
import { Ticket } from '../models/ticket';

export interface RankingItem {
  username: string;
  puntosTotales: number;
  posicion: number;
  ticketId?: number;
  usuarioId?: number;  // Añadimos el ID de usuario para facilitar actualizaciones
  detallePronosticos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private ticketService: TicketService,
    private usuarioService: UsuarioService
  ) { }

  // Obtener ranking general
  getRankingGeneral(): Observable<RankingItem[]> {
    return this.http.get<RankingItem[]>(`${this.apiUrl}/tickets/ranking/general`).pipe(
      catchError(error => {
        console.log('Error en getRankingGeneral:', error);
        return of([]);
      })
    );
  }

  // Obtener ranking por fecha
  getRankingPorFecha(fechaId: number): Observable<RankingItem[]> {
    return this.http.get<RankingItem[]>(`${this.apiUrl}/tickets/ranking/fecha/${fechaId}`).pipe(
      catchError(error => {
        console.log('Error en getRankingPorFecha:', error);
        return of([]);
      })
    );
  }

  // Obtener detalle de pronósticos de un ticket
  getDetalleTicket(ticketId: number): Observable<any> {
    return this.ticketService.getTicketById(ticketId).pipe(
      catchError(error => {
        return of({ pronosticos: [] });
      })
    );
  }
}
