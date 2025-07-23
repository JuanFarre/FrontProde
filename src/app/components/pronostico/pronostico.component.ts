import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PronosticoService } from '../../services/pronostico.service';
import { PartidoService } from '../../services/partido.service';
import { Pronostico } from '../../models/pronostico';
import { Partido } from '../../models/partido';
import { UsuarioService } from '../../services/usuario.service';
import { EquipoService } from '../../services/equipo.service';
import { FechaService } from '../../services/fecha.service';
import { Equipo } from '../../models/equipo';
import { Fecha } from '../../models/fecha';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pronostico',
  templateUrl: './pronostico.component.html',
  styleUrls: ['./pronostico.component.css']
})
export class PronosticoComponent implements OnInit {
  pronosticos: Pronostico[] = [];
  partidos: Partido[] = [];
  usuarios: any[] = [];
  equipos: Equipo[] = [];
  fechas: Fecha[] = [];
  fechaSeleccionadaId: number | null = null;
  pronosticoForm: FormGroup;
  editando: boolean = false;
  pronosticoEditandoId?: number;
  mensaje: string = '';
  pronosticosPorPartido: { [partidoId: number]: string } = {};
  fechaActual: string = '16'; // Cambia el número según la fecha que corresponda

  constructor(
    private pronosticoService: PronosticoService,
    private partidoService: PartidoService,
    private usuarioService: UsuarioService,
    private equipoService: EquipoService,
    private fechaService: FechaService,
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.pronosticoForm = this.fb.group({
      partidoId: [null, Validators.required],
      resultadoPronosticado: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarEquipos();
    this.cargarFechas();
    this.cargarUsuarios();
    this.cargarPronosticos();
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe(equipos => this.equipos = equipos);
  }

  cargarFechas() {
    this.fechaService.getFechas().subscribe(fechas => {
      this.fechas = fechas;
      if (fechas.length > 0) {
        // Selecciona la fecha con id más alto (última)
        const maxFecha = fechas.reduce((a, b) => (a.id! > b.id! ? a : b));
        this.fechaSeleccionadaId = maxFecha.id!;
        this.cargarPartidosPorFecha(this.fechaSeleccionadaId);
      }
    });
  }

  cargarPartidosPorFecha(fechaId: number) {
    // Limpiar pronósticos anteriores al cambiar de fecha
    this.pronosticosPorPartido = {};
    
    this.partidoService.getPartidos().subscribe(partidos => {
      this.partidos = partidos.filter(p => p.fechaId === fechaId);
      
      // Inicializar pronósticos si hay partidos y la fecha no ha empezado
      if (this.partidos.length > 0 && this.puedeHacerPronosticos(fechaId)) {
        this.partidos.forEach(p => {
          if (!(p.id! in this.pronosticosPorPartido)) {
            this.pronosticosPorPartido[p.id!] = '';
          }
        });
      }
    });
  }

  // Método para verificar si una fecha ya empezó
  fechaYaEmpezó(fechaId: number): boolean {
    const fecha = this.fechas.find(f => f.id === fechaId);
    return fecha ? fecha.empezada === true : false;
  }

  // Método alternativo sin acentos para el template
  fechaYaEmpeze(fechaId: number): boolean {
    return this.fechaYaEmpezó(fechaId);
  }

  // Verificar si se pueden hacer pronósticos para una fecha
  puedeHacerPronosticos(fechaId: number): boolean {
    return !this.fechaYaEmpezó(fechaId);
  }

  // Método para obtener mensaje de estado de la fecha
  getMensajeFecha(fechaId: number): string {
    if (this.fechaYaEmpezó(fechaId)) {
      return '⚠️ Esta fecha ya empezó. No se pueden realizar pronósticos.';
    }
    return '✅ Pronósticos habilitados para esta fecha.';
  }

  cargarUsuarios() {
    // Si tienes un método getUsuarios en el backend, implementa aquí la llamada
    // Por ahora, simula usuarios
    this.usuarios = [
      { id: 1, nombre: 'Usuario 1' },
      { id: 2, nombre: 'Usuario 2' }
    ];
  }

  cargarPronosticos() {
    this.pronosticoService.getPronosticos().subscribe(pronosticos => this.pronosticos = pronosticos);
  }

  onPronosticoChange(partidoId: number, resultado: string) {
    this.pronosticosPorPartido[partidoId] = resultado;
  }

  guardarPronosticos() {
    const usuarioId = this.authService.getUserId();
    if (!usuarioId) {
      this.showMessage('Error: No se pudo obtener el ID de usuario.');
      return;
    }
    
    const pronosticosAEnviar = Object.entries(this.pronosticosPorPartido)
      .filter(([_, resultado]) => resultado && resultado !== '')
      .map(([partidoId, resultadoPronosticado]) => ({
        usuarioId,
        partidoId: Number(partidoId),
        resultadoPronosticado
      }));
      
    if (pronosticosAEnviar.length === 0) {
      this.showMessage('Debes seleccionar al menos un pronóstico.');
      return;
    }
    
    // Enviar todos los pronósticos (puedes adaptar a una llamada batch si el backend lo permite)
    let completados = 0;
    pronosticosAEnviar.forEach(pronostico => {
      this.pronosticoService.crearPronostico(pronostico).subscribe({
        next: () => {
          completados++;
          if (completados === pronosticosAEnviar.length) {
            this.showMessage('¡Pronósticos guardados correctamente!');
            this.cargarPronosticos();
          }
        },
        error: () => this.showMessage('Error al guardar los pronósticos. Por favor, intenta nuevamente.')
      });
    });
  }

  guardarTicket() {
    const usuarioId = this.authService.getUserId();
    const fechaId = this.fechaSeleccionadaId;
    
    if (!usuarioId) {
      this.showMessage('Error: No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    if (!fechaId) {
      this.showMessage('Debes seleccionar una fecha para crear tu ticket.');
      return;
    }
    
    // Verificar si la fecha ya empezó
    if (this.fechaYaEmpezó(fechaId)) {
      this.showMessage('⚠️ No se pueden realizar pronósticos para esta fecha porque ya empezó.');
      return;
    }
    
    // Verificar que la fecha tenga partidos
    if (!this.partidos || this.partidos.length === 0) {
      this.showMessage('No hay partidos disponibles para esta fecha. No se puede crear un ticket.');
      return;
    }
    
    // Validar que todos los partidos tengan pronóstico
    const pronosticosAEnviar = this.partidos.map(partido => {
      const resultado = this.pronosticosPorPartido[partido.id!];
      return {
        usuarioId,
        partidoId: partido.id!,
        resultadoPronosticado: resultado,
        puntosObtenidos: 0 // o null, según backend
      };
    });
    
    // Verificar si hay pronósticos sin completar
    const partidosSinPronostico = pronosticosAEnviar.filter(p => !p.resultadoPronosticado || p.resultadoPronosticado === '');
    if (partidosSinPronostico.length > 0) {
      this.showMessage(`Debes completar todos los pronósticos de la fecha. Te ${partidosSinPronostico.length === 1 ? 'falta 1 partido' : 'faltan ' + partidosSinPronostico.length + ' partidos'}.`);
      return;
    }
    
    const ticket: Ticket = {
      usuarioId,
      fechaId,
      fechaCreacion: new Date().toISOString(),
      pronosticos: pronosticosAEnviar
    };
    
    this.ticketService.crearTicket(ticket).subscribe({
      next: () => {
        this.showMessage('¡Ticket enviado correctamente! Buena suerte con tus pronósticos.');
        // Opcional: limpiar pronósticosPorPartido
      },
      error: (err) => {
        this.showMessage('Error al enviar el ticket. Por favor intenta nuevamente.');
      }
    });
  }

  onSubmit() {
    if (this.pronosticoForm.invalid) return;
    
    const usuarioId = this.authService.getUserId();
    if (!usuarioId) {
      this.showMessage('Error: No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    const formValue = {
      ...this.pronosticoForm.value,
      usuarioId
    };
    
    if (this.editando && this.pronosticoEditandoId != null) {
      this.pronosticoService.actualizarPronostico(this.pronosticoEditandoId, formValue).subscribe({
        next: () => {
          this.showMessage('Pronóstico actualizado correctamente');
          this.editando = false;
          this.pronosticoForm.reset();
          this.cargarPronosticos();
        },
        error: () => this.showMessage('Error al actualizar el pronóstico. Por favor, intenta nuevamente.')
      });
    } else {
      this.pronosticoService.crearPronostico(formValue).subscribe({
        next: () => {
          this.showMessage('Pronóstico creado correctamente');
          this.pronosticoForm.reset();
          this.cargarPronosticos();
        },
        error: () => this.showMessage('Error al crear el pronóstico. Por favor, intenta nuevamente.')
      });
    }
  }

  editarPronostico(pronostico: Pronostico) {
    this.editando = true;
    this.pronosticoEditandoId = pronostico.id;
    
    // Excluimos usuarioId del patch ya que lo obtendremos del AuthService
    this.pronosticoForm.patchValue({
      partidoId: pronostico.partidoId,
      resultadoPronosticado: pronostico.resultadoPronosticado
    });
  }

  eliminarPronostico(id?: number) {
    if (!id) return;
    this.pronosticoService.eliminarPronostico(id).subscribe({
      next: () => {
        this.showMessage('Pronóstico eliminado correctamente');
        this.cargarPronosticos();
      },
      error: () => this.showMessage('Error al eliminar el pronóstico. Por favor, intenta nuevamente.')
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.pronosticoEditandoId = undefined;
    this.pronosticoForm.reset();
  }

  onFechaChange(fechaId: number) {
    this.fechaSeleccionadaId = fechaId;
    this.cargarPartidosPorFecha(fechaId);
  }

  getNombreUsuario(id: number): string {
    const usuario = this.usuarios.find(u => u.id === id);
    return usuario ? usuario.nombre : id?.toString();
  }

  getNombreEquipo(id: number): string {
    const equipo = this.equipos.find(e => e.id === id);
    return equipo ? equipo.nombre : id?.toString();
  }

  getNombrePartido(id: number): string {
    const partido = this.partidos.find(p => p.id === id);
    if (!partido) return id?.toString();
    return `${this.getNombreEquipo(partido.equipoLocalId)} vs ${this.getNombreEquipo(partido.equipoVisitanteId)}`;
  }

  getEscudoEquipo(id: number): string {
    const equipo = this.equipos.find(e => e.id === id);
    return equipo?.escudoUrl || 'assets/img/escudo-default.svg';
  }

  partidoRequierePrediction(partidoId: number): boolean {
    // Verificar si el pronóstico no existe o está vacío
    return !this.pronosticosPorPartido[partidoId] || this.pronosticosPorPartido[partidoId] === '';
  }

  showMessage(message: string) {
    this.mensaje = message;
    // Hacer que el mensaje desaparezca después de 6 segundos
    setTimeout(() => {
      if (this.mensaje === message) { // Solo borrar si no ha cambiado
        this.mensaje = '';
      }
    }, 6000);
  }
}
