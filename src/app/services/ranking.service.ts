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
    // Primero obtenemos todos los tickets
    return this.ticketService.getAllTickets().pipe(
      // Procesamos los tickets para obtener IDs de usuario únicos
      mergeMap(tickets => {
        // Si no hay tickets, devolvemos un array vacío
        if (tickets.length === 0) {
          return of([]);
        }
        
        // Extraemos los IDs de usuario únicos
        const usuarioIds = [...new Set(tickets.map(ticket => ticket.usuarioId))];
        
        // Cargamos los usuarios para tener sus nombres en caché
        const usuarioRequests = usuarioIds.map(id => 
          this.usuarioService.getUsuarioById(id).pipe(
            catchError(() => of(null)) // Si falla, continuamos con null
          )
        );
        
        // Esperamos que se carguen todos los usuarios, luego procesamos el ranking
        return forkJoin(usuarioRequests).pipe(
          map(() => this.procesarTicketsParaRanking(tickets))
        );
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  // Obtener ranking por fecha
  getRankingPorFecha(fechaId: number): Observable<RankingItem[]> {
    return this.ticketService.getAllTickets().pipe(
      mergeMap(tickets => {
        // Filtrar los tickets que pertenecen a la fecha seleccionada
        const ticketsFiltrados = tickets.filter(ticket => {
          // Convertir ambos a número para asegurar que la comparación es correcta
          const ticketFechaId = Number(ticket.fechaId);
          const paramFechaId = Number(fechaId);
          
          const coincide = ticketFechaId === paramFechaId;
          return coincide;
        });
        
        if (ticketsFiltrados.length === 0) {
          return of([]);
        }
        
        // Extraemos los IDs de usuario únicos
        const usuarioIds = [...new Set(ticketsFiltrados.map(ticket => ticket.usuarioId))];
        
        // Cargamos los usuarios para tener sus nombres en caché
        const usuarioRequests = usuarioIds.map(id => 
          this.usuarioService.getUsuarioById(id).pipe(
            catchError(() => of(null)) // Si falla, continuamos con null
          )
        );
        
        // Esperamos que se carguen todos los usuarios, luego procesamos el ranking
        return forkJoin(usuarioRequests).pipe(
          map(() => this.procesarTicketsParaRanking(ticketsFiltrados))
        );
      }),
      catchError(error => {
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
  
  // Método para actualizar los usernames en los rankings (útil cuando se cargan nuevos usuarios)
  actualizarUsernames(rankingItems: RankingItem[]): RankingItem[] {
    return rankingItems.map(item => {
      if (item.usuarioId) {
        const username = this.usuarioService.getUsernameCached(item.usuarioId);
        if (username && username !== item.username) {
          return {
            ...item,
            username
          };
        }
      }
      return item;
    });
  }

  // Método para procesar tickets y generar el ranking
  private procesarTicketsParaRanking(tickets: Ticket[]): RankingItem[] {
    // Agrupar tickets por usuario
    const ticketsPorUsuario = this.agruparTicketsPorUsuario(tickets);
    
    // Convertir a array de items de ranking
    const rankingItems: RankingItem[] = [];
    
    // Para cada usuario, calculamos el total de puntos
    for (const [usuarioId, ticketsUsuario] of ticketsPorUsuario.entries()) {
      // Calculamos puntos totales
      const puntosTotales = ticketsUsuario.reduce(
        (total, ticket) => total + this.calcularPuntosTotales(ticket), 0
      );
      
      // Encontramos el ticket con más puntos de este usuario
      let mejorTicket = ticketsUsuario[0];
      let mejorPuntaje = this.calcularPuntosTotales(mejorTicket);
      
      for (const ticket of ticketsUsuario) {
        const puntaje = this.calcularPuntosTotales(ticket);
        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejorTicket = ticket;
        }
      }
      
      // Obtenemos el username del usuario del caché si está disponible
      const cachedUsername = this.usuarioService.getUsernameCached(usuarioId);
      const username = cachedUsername || `Usuario ${usuarioId}`;
      
      // Agregamos el item al ranking
      rankingItems.push({
        username,
        puntosTotales,
        posicion: 0, // Se asignará después
        ticketId: mejorTicket.id,
        usuarioId: usuarioId // Guardamos el ID para actualizaciones futuras
      });
    }
    
    // Ordenamos por puntos (de mayor a menor)
    rankingItems.sort((a, b) => b.puntosTotales - a.puntosTotales);
    
    // Asignamos posiciones
    return rankingItems.map((item, index) => ({
      ...item,
      posicion: index + 1
    }));
  }
  
  // Método para agrupar tickets por usuario
  private agruparTicketsPorUsuario(tickets: Ticket[]): Map<number, Ticket[]> {
    const ticketsPorUsuario = new Map<number, Ticket[]>();
    
    for (const ticket of tickets) {
      if (!ticketsPorUsuario.has(ticket.usuarioId)) {
        ticketsPorUsuario.set(ticket.usuarioId, []);
      }
      
      ticketsPorUsuario.get(ticket.usuarioId)!.push(ticket);
    }
    
    return ticketsPorUsuario;
  }

  // Método para calcular los puntos totales de un ticket
  private calcularPuntosTotales(ticket: Ticket): number {
    if (!ticket || !ticket.pronosticos) return 0;
    
    return ticket.pronosticos.reduce((total, pronostico) => 
      total + (pronostico.puntosObtenidos || 0), 0);
  }
}
