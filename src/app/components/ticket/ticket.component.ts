import { Component, OnInit } from '@angular/core';
import { Ticket } from '../../models/ticket';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { FechaService } from '../../services/fecha.service';
import { EquipoService } from '../../services/equipo.service';
import { PartidoService } from '../../services/partido.service';
import { Fecha } from '../../models/fecha';
import { Equipo } from '../../models/equipo';
import { Partido } from '../../models/partido';
import { trigger, transition, style, animate } from '@angular/animations';

// Extendemos la interfaz Ticket para incluir mostrarDetalles
interface TicketExtended extends Ticket {
  mostrarDetalles?: boolean;
}

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css'],
  animations: [
    trigger('detallesAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: '0' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: '0' }))
      ])
    ])
  ]
})
export class TicketComponent implements OnInit {
  tickets: TicketExtended[] = [];
  fechas: Fecha[] = [];
  equipos: Equipo[] = [];
  partidos: Partido[] = [];
  mensaje: string = '';
  cargando: boolean = true;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private fechaService: FechaService,
    private equipoService: EquipoService,
    private partidoService: PartidoService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar datos básicos
    this.cargando = true;

    // Obtener equipos para mostrar nombres
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
        
        // Obtener fechas para mostrar nombres
        this.fechaService.getFechas().subscribe({
          next: (fechas) => {
            this.fechas = fechas;
            
            // Obtener partidos para mostrar detalles
            this.partidoService.getPartidos().subscribe({
              next: (partidos) => {
                this.partidos = partidos;
                
                // Finalmente, cargar tickets del usuario
                this.cargarTicketsUsuario();
              },
              error: (error) => {
                this.mensaje = 'Error al cargar partidos';
                this.cargando = false;
              }
            });
          },
          error: (error) => {
            this.mensaje = 'Error al cargar fechas';
            this.cargando = false;
          }
        });
      },
      error: (error) => {
        this.mensaje = 'Error al cargar equipos';
        this.cargando = false;
      }
    });
  }  cargarTicketsUsuario(): void {
    // El backend ahora se encarga de filtrar los tickets por usuario autenticado
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets.map(ticket => ({
          ...ticket,
          mostrarDetalles: false
        }));
        
        if (this.tickets.length === 0) {
          this.mensaje = 'No tienes tickets creados';
        } else {
          this.mensaje = `Se han cargado ${this.tickets.length} tickets`;
        }
        
        this.cargando = false;
      },
      error: (error) => {
        this.mensaje = 'Error al cargar tickets';
        this.cargando = false;
      }
    });
  }
  toggleDetalles(ticket: TicketExtended): void {
    // Si se está cerrando el ticket actual, simplemente cambiamos su estado
    if (ticket.mostrarDetalles) {
      ticket.mostrarDetalles = false;
      return;
    }
    
    // Si se está abriendo, primero cerramos todos los demás tickets
    this.tickets.forEach(t => {
      t.mostrarDetalles = false;
    });
    
    // Y luego abrimos el ticket seleccionado
    ticket.mostrarDetalles = true;
  }

  getNombreFecha(fechaId: number): string {
    const fecha = this.fechas.find(f => f.id === fechaId);
    return fecha ? fecha.nombre : 'Fecha desconocida';
  }

  getNombreEquipo(equipoId: number): string {
    const equipo = this.equipos.find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo desconocido';
  }

  getPartidoInfo(partidoId: number): string {
    const partido = this.partidos.find(p => p.id === partidoId);
    if (!partido) return 'Partido desconocido';
    
    const local = this.getNombreEquipo(partido.equipoLocalId);
    const visitante = this.getNombreEquipo(partido.equipoVisitanteId);
    
    return `${local} vs ${visitante}`;
  }

  getEquipoLocal(partidoId: number): Equipo | undefined {
    const partido = this.partidos.find(p => p.id === partidoId);
    if (!partido) return undefined;
    return this.equipos.find(e => e.id === partido.equipoLocalId);
  }

  getEquipoVisitante(partidoId: number): Equipo | undefined {
    const partido = this.partidos.find(p => p.id === partidoId);
    if (!partido) return undefined;
    return this.equipos.find(e => e.id === partido.equipoVisitanteId);
  }

  getEscudoUrl(equipoId: number): string {
    const equipo = this.equipos.find(e => e.id === equipoId);
    return equipo?.escudoUrl || 'assets/img/escudo-default.svg';
  }

  // Obtiene el resultado del partido en formato "X - Y" o "No jugado"
  getResultadoPartido(partidoId: number): string {
    const partido = this.partidos.find(p => p.id === partidoId);
    if (!partido) return 'Partido no encontrado';
    
    // Si el partido no se ha jugado
    if (!this.partidoSeJugo(partidoId)) {
      return 'No jugado';
    }
    
    // Si el partido se jugó, mostrar el resultado
    if (partido.golesLocal !== null && partido.golesLocal !== undefined &&
        partido.golesVisitante !== null && partido.golesVisitante !== undefined) {
      return `${partido.golesLocal} - ${partido.golesVisitante}`;
    }
    
    return 'Resultado no disponible';
  }

  // Convierte el resultado pronosticado a un formato legible
  formatearResultado(resultado: string): string {
    switch(resultado) {
      case 'LOCAL': return 'Gana Local';
      case 'VISITANTE': return 'Gana Visitante';
      case 'EMPATE': return 'Empate';
      default: return resultado;
    }
  }

  // Calcula los puntos totales del ticket
  calcularPuntosTotales(ticket: Ticket): number {
    return ticket.pronosticos.reduce((total, pronostico) => 
      total + (pronostico.puntosObtenidos || 0), 0);
  }

  // Determina si un partido ya se jugó basándose en el campo finalizado Y si tiene goles
partidoSeJugo(partidoId: number): boolean {
  const partido = this.partidos.find(p => p.id === partidoId);
  
  if (!partido) return false;
  
  // Un partido se considera "jugado" si:
  // 1. Está marcado como finalizado, O
  // 2. Tiene goles asignados (está "En Juego")
  return partido.finalizado === true || 
         (partido.golesLocal !== null && partido.golesVisitante !== null);
}

  // Obtiene el texto del estado del pronóstico
  getEstadoTexto(pronostico: any): string {
    // Si el partido no se ha jugado, está pendiente
    if (!this.partidoSeJugo(pronostico.partidoId)) {
      return 'Pendiente';
    }
    
    // Si el partido se jugó, verificamos si acertó o erró
    if (pronostico.puntosObtenidos > 0) {
      return 'Acertado';
    } else {
      return 'Errado';
    }
  }

  // Obtiene las clases CSS para el estado del pronóstico
  getEstadoClase(pronostico: any): { [key: string]: boolean } {
    const estado = this.getEstadoTexto(pronostico);
    return {
      'acertado': estado === 'Acertado',
      'errado': estado === 'Errado',
      'pendiente': estado === 'Pendiente'
    };
  }

  eliminarTicket(id: number): void {
    if (confirm('¿Estás seguro de eliminar este ticket?')) {
      this.ticketService.eliminarTicket(id).subscribe({
        next: () => {
          this.mensaje = 'Ticket eliminado correctamente';
          // Recargar los tickets
          this.cargarTicketsUsuario();
        },
        error: (error) => {
          this.mensaje = 'Error al eliminar el ticket';
        }
      });
    }
  }
}
