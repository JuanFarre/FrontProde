import { Component, OnInit, OnDestroy } from '@angular/core';
import { RankingService, RankingItem } from '../../services/ranking.service';
import { FechaService } from '../../services/fecha.service';
import { UsuarioService } from '../../services/usuario.service';
import { EquipoService } from '../../services/equipo.service';
import { PartidoService } from '../../services/partido.service';
import { Fecha } from '../../models/fecha';
import { Equipo } from '../../models/equipo';
import { Partido } from '../../models/partido';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  animations: [
    trigger('detalleAnimation', [
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
export class RankingComponent implements OnInit, OnDestroy {
  // Datos de ranking
  rankingGeneral: RankingItem[] = [];
  rankingPorFecha: RankingItem[] = [];
  
  // Lista de fechas disponibles
  fechas: Fecha[] = [];
  fechaSeleccionada: number = 0;
  
  // Datos adicionales para el detalle
  equipos: Equipo[] = [];
  partidos: Partido[] = [];
  
  // Control de vista
  mostrarRankingGeneral: boolean = true;
  cargando: boolean = false;
  mensaje: string = '';
  
  // Control de detalles expandidos
  itemExpandido: number | null = null;
  detallePronosticos: any[] = [];
  
  // Control de actualización
  private actualizarSubscription?: Subscription;

  constructor(
    private rankingService: RankingService,
    private fechaService: FechaService,
    private usuarioService: UsuarioService,
    private equipoService: EquipoService,
    private partidoService: PartidoService
  ) { }

  ngOnInit(): void {
    // Iniciar carga simultánea de fechas y ranking general
    this.cargarFechas();
    this.cargarEquipos();
    this.cargarPartidos();
    
    // Cargar ranking general después de un breve retraso para permitir la carga de otros datos
    setTimeout(() => {
      this.cargarRankingGeneral();
    }, 500);
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones al destruir el componente
    if (this.actualizarSubscription) {
      this.actualizarSubscription.unsubscribe();
    }
  }

  cargarFechas(): void {
    this.cargando = true;
    this.fechaService.getFechas().subscribe({
      next: (fechas) => {
        this.fechas = fechas;
        this.cargando = false;
      },
      error: (error) => {
        this.mensaje = 'Error al cargar las fechas';
        this.cargando = false;
      }
    });
  }

  cargarRankingGeneral(): void {
    this.cargando = true;
    this.rankingService.getRankingGeneral().subscribe({
      next: (ranking) => {
        this.rankingGeneral = this.limpiarDatosRanking(ranking);
        this.cargando = false;
        this.mostrarRankingGeneral = true;
        if (ranking.length === 0) {
          this.mensaje = 'No hay datos disponibles para el ranking general';
        } else {
          this.mensaje = '';
        }
        
        // Actualizar nombres después de un breve retraso para permitir que se carguen los usuarios
        setTimeout(() => {
          this.actualizarNombresUsuario();
        }, 2000);
      },
      error: (error) => {
        this.mensaje = 'Error al cargar el ranking general';
        this.cargando = false;
      }
    });
  }

  cambiarFecha(event: any): void {
    this.fechaSeleccionada = parseInt(event.target.value, 10);
    this.cargarRankingPorFecha();
  }

  cargarRankingPorFecha(): void {
    if (!this.fechaSeleccionada) {
      this.mensaje = 'Selecciona una fecha para ver el ranking';
      return;
    }
    
    this.cargando = true;
    this.rankingService.getRankingPorFecha(this.fechaSeleccionada).subscribe({
      next: (ranking) => {
        this.rankingPorFecha = this.limpiarDatosRanking(ranking);
        this.cargando = false;
        this.mostrarRankingGeneral = false;
        if (ranking.length === 0) {
          this.mensaje = 'No hay datos disponibles para esta fecha';
        } else {
          this.mensaje = '';
        }
        
        // Actualizar nombres después de un breve retraso para permitir que se carguen los usuarios
        setTimeout(() => {
          this.actualizarNombresUsuario();
        }, 2000);
      },
      error: (error) => {
        this.mensaje = 'Error al cargar el ranking por fecha';
        this.cargando = false;
      }
    });
  }
  
  // Método para limpiar y formatear datos del ranking
  limpiarDatosRanking(ranking: RankingItem[]): RankingItem[] {
    return ranking.map(item => ({
      ...item,
      username: this.formatearNombreUsuario(item.username, item.usuarioId)
    }));
  }
  
  // Método para formatear nombres de usuario
  formatearNombreUsuario(username: string, usuarioId?: number): string {
    // Si no hay username, usar ID como fallback
    if (!username || username.trim() === '') {
      return usuarioId ? `Usuario ${usuarioId}` : 'Usuario';
    }
    
    // Si el username parece una contraseña hasheada (texto muy largo y sin espacios)
    if (username.length > 100 && !username.includes(' ')) {
      return usuarioId ? `Usuario ${usuarioId}` : 'Usuario';
    }
    
    // Si es el formato "Usuario ID", intentar obtener el nombre real
    if (username.startsWith('Usuario ') && usuarioId) {
      // Intentar cargar el usuario para obtener su nombre real
      this.usuarioService.getUsuarioById(usuarioId).subscribe({
        next: (usuario) => {
          // El usuario se guardará en caché automáticamente
        },
        error: () => {
          // Si falla, mantenemos el formato Usuario ID
        }
      });
      
      // Verificar si ya tenemos el nombre en caché
      const nombreCached = this.usuarioService.getUsernameCached(usuarioId);
      if (nombreCached && nombreCached !== username && !nombreCached.startsWith('Usuario ')) {
        return nombreCached;
      }
    }
    
    // En todos los demás casos, preservar el nombre de usuario tal como viene
    return username;
  }

  cambiarVistaRanking(esGeneral: boolean): void {
    this.mostrarRankingGeneral = esGeneral;
    this.itemExpandido = null;
    
    if (esGeneral) {
      this.cargarRankingGeneral();
    } else if (this.fechaSeleccionada) {
      this.cargarRankingPorFecha();
    }
  }

  // Método para actualizar nombres de usuario cuando se cargan nuevos datos
  private actualizarNombresUsuario(): void {
    // Actualizar ranking general si existe
    if (this.rankingGeneral.length > 0) {
      this.rankingGeneral = this.rankingGeneral.map(item => ({
        ...item,
        username: this.formatearNombreUsuario(item.username, item.usuarioId)
      }));
    }

    // Actualizar ranking por fecha si existe
    if (this.rankingPorFecha.length > 0) {
      this.rankingPorFecha = this.rankingPorFecha.map(item => ({
        ...item,
        username: this.formatearNombreUsuario(item.username, item.usuarioId)
      }));
    }
  }

  verDetalle(item: RankingItem): void {
    if (this.itemExpandido === item.ticketId) {
      // Si ya está expandido, lo cerramos
      this.itemExpandido = null;
      this.detallePronosticos = [];
      return;
    }
    
    // Si hay un ticket ID disponible, cargamos su detalle
    if (item.ticketId) {
      this.cargando = true;
      this.rankingService.getDetalleTicket(item.ticketId).subscribe({
        next: (detalle) => {
          this.detallePronosticos = detalle.pronosticos || [];
          this.itemExpandido = item.ticketId || null;
          this.cargando = false;
        },
        error: (error) => {
          this.mensaje = 'Error al cargar los detalles del pronóstico';
          this.itemExpandido = null;
          this.detallePronosticos = [];
          this.cargando = false;
        }
      });
    }
  }

  // Determina si el elemento debe mostrar sus detalles
  mostrarDetalle(ticketId?: number): boolean {
    return ticketId !== undefined && this.itemExpandido === ticketId;
  }

  // Formatea el resultado para mostrar
  formatearResultado(resultado: string): string {
    switch(resultado) {
      case 'LOCAL': return 'Gana Local';
      case 'VISITANTE': return 'Gana Visitante';
      case 'EMPATE': return 'Empate';
      default: return resultado;
    }
  }

  // Métodos adicionales para el detalle (copiados del TicketComponent)
  cargarEquipos(): void {
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
      },
      error: (error) => {
        // Error silencioso
      }
    });
  }

  cargarPartidos(): void {
    this.partidoService.getPartidos().subscribe({
      next: (partidos) => {
        this.partidos = partidos;
      },
      error: (error) => {
        // Error silencioso
      }
    });
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
}
