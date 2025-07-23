import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { Ticket } from '../models/ticket';
import { API_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${API_URL}/tickets`;
  
  // Cache para tickets
  private allTicketsCache: Ticket[] = [];
  private lastFetchTime: number = 0;
  private cacheDuration = 60000; // 1 minuto en milisegundos
  
  // Observable para notificar cuando los tickets se actualizan
  private ticketsUpdated = new BehaviorSubject<boolean>(false);
  public ticketsUpdated$ = this.ticketsUpdated.asObservable();

  constructor(private http: HttpClient) {}

  crearTicket(ticket: Ticket): Observable<Ticket> {
    // Ahora el backend extraerá el ID del usuario del token JWT
    return this.http.post<Ticket>(`${this.apiUrl}/create`, ticket).pipe(
      tap(() => {
        // Invalidar caché al crear un nuevo ticket
        this.invalidateCache();
      })
    );
  }

  // Obtiene solo los tickets del usuario autenticado
  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl).pipe(
      catchError(error => {
        return of([]);
      }),
      shareReplay(1)
    );
  }

  // Para administradores que necesiten ver todos los tickets
  getAllTickets(): Observable<Ticket[]> {
    const now = Date.now();
    
    // Si tenemos datos en caché y son recientes, los devolvemos
    if (this.allTicketsCache.length > 0 && (now - this.lastFetchTime) < this.cacheDuration) {
      return of(this.allTicketsCache);
    }
    
    // Si no hay caché o está vencida, hacemos la petición
    return this.http.get<Ticket[]>(`${this.apiUrl}/all`).pipe(
      catchError(error => {
        // Si hay error, devolvemos la caché aunque esté vencida, o un array vacío
        return of(this.allTicketsCache.length > 0 ? this.allTicketsCache : []);
      }),
      tap(tickets => {
        // Actualizamos la caché y el timestamp
        this.allTicketsCache = tickets;
        this.lastFetchTime = Date.now();
        this.ticketsUpdated.next(true);
      }),
      shareReplay(1) // Compartimos la respuesta entre múltiples suscriptores
    );
  }

  // Ya no es necesario debido a que el backend implementa esta funcionalidad
  getTicketsByUsuarioId(usuarioId: number): Observable<Ticket[]> {
    // Redirigimos a getMyTickets() ya que el backend ahora maneja esto
    return this.getMyTickets();
  }

  getTicketById(id: number): Observable<Ticket> {
    // Intentamos primero buscar en la caché
    const cachedTicket = this.allTicketsCache.find(t => t.id === id);
    if (cachedTicket) {
      return of(cachedTicket);
    }
    
    // Si no está en caché, lo pedimos al backend
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        return of(null as unknown as Ticket);
      })
    );
  }

  eliminarTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => {
        // Invalidar caché al eliminar un ticket
        this.invalidateCache();
      })
    );
  }
  
  // Método para invalidar la caché manualmente
  invalidateCache(): void {
    this.allTicketsCache = [];
    this.lastFetchTime = 0;
  }
  
  // Método para forzar una actualización
  forceRefresh(): Observable<Ticket[]> {
    this.invalidateCache();
    return this.getAllTickets();
  }
}
