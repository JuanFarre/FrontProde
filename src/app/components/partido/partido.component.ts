import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartidoService } from '../../services/partido.service';
import { Partido } from '../../models/partido';
import { FechaService } from '../../services/fecha.service';
import { EquipoService } from '../../services/equipo.service';

@Component({
  selector: 'app-partido',
  templateUrl: './partido.component.html',
  styleUrls: ['./partido.component.css']
})
export class PartidoComponent implements OnInit {
  partidos: Partido[] = [];
  partidosFiltrados: Partido[] = [];
  fechas: any[] = [];
  equipos: any[] = [];
  partidoForm: FormGroup;
  editando: boolean = false;
  partidoEditandoId?: number;
  mensaje: string = '';
  fechaFiltro: number | string = '';

  // Opciones para el estado del partido
  estadosPartido = [
    { valor: 'no-empezado', texto: 'No Empezado' },
    { valor: 'en-juego', texto: 'En Juego' },
    { valor: 'finalizado', texto: 'Finalizado' }
  ];

  constructor(
    private partidoService: PartidoService,
    private fechaService: FechaService,
    private equipoService: EquipoService,
    private fb: FormBuilder
  ) {
    this.partidoForm = this.fb.group({
      fechaId: [null, Validators.required],
      equipoLocalId: [null, Validators.required],
      equipoVisitanteId: [null, Validators.required],
      golesLocal: [null],
      golesVisitante: [null],
      finalizado: [false],
      estado: ['no-empezado'] // Campo para manejar el estado
    });
  }

  ngOnInit() {
    this.cargarFechas();
    this.cargarEquipos();
    this.cargarPartidos();
  }

  cargarFechas() {
    this.fechaService.getFechas().subscribe(fechas => this.fechas = fechas);
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe(equipos => this.equipos = equipos);
  }

  cargarPartidos() {
    this.partidoService.getPartidos().subscribe(partidos => {
      this.partidos = partidos;
      this.filtrarPartidos();
    });
  }

  onSubmit() {
    if (this.partidoForm.invalid) return;

    const formValue = this.partidoForm.value;

    if (this.editando && this.partidoEditandoId != null) {
      this.partidoService.actualizarPartido(this.partidoEditandoId, formValue).subscribe({
        next: () => {
          this.mensaje = 'Partido actualizado';
          
          // Recalcular tickets después de actualizar partido
          this.recalcularTicketsAfectados(this.partidoEditandoId!);
          
          this.editando = false;
          this.partidoForm.reset();
          this.cargarPartidos();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    } else {
      this.partidoService.crearPartido(formValue).subscribe({
        next: () => {
          this.mensaje = 'Partido creado';
          this.partidoForm.reset();
          this.cargarPartidos();
        },
        error: () => this.mensaje = 'Error al crear'
      });
    }
  }

  // Método para recalcular tickets afectados por cambios en un partido
  private recalcularTicketsAfectados(partidoId: number) {
    // Llamar al backend para que recalcule los tickets
    this.partidoService.recalcularTickets(partidoId).subscribe({
      next: () => {
        console.log('Tickets recalculados correctamente');
      },
      error: (error) => {
        console.error('Error al recalcular tickets:', error);
      }
    });
  }

  editarPartido(partido: Partido) {
    this.editando = true;
    this.partidoEditandoId = partido.id;
    
    // Determinar el estado actual del partido
    let estadoActual = 'no-empezado';
    if (partido.finalizado) {
      estadoActual = 'finalizado';
    } else if (partido.golesLocal !== null && partido.golesVisitante !== null) {
      estadoActual = 'en-juego';
    }
    
    this.partidoForm.patchValue({
      ...partido,
      estado: estadoActual
    });
  }

  // Método para manejar el cambio de estado
  onEstadoChange(estado: string) {
    switch(estado) {
      case 'no-empezado':
        this.partidoForm.patchValue({
          golesLocal: null,
          golesVisitante: null,
          finalizado: false
        });
        // Deshabilitar validaciones de goles
        this.partidoForm.get('golesLocal')?.clearValidators();
        this.partidoForm.get('golesVisitante')?.clearValidators();
        break;
      case 'en-juego':
        this.partidoForm.patchValue({
          finalizado: false
        });
        // Habilitar validaciones de goles
        this.partidoForm.get('golesLocal')?.setValidators([Validators.required, Validators.min(0)]);
        this.partidoForm.get('golesVisitante')?.setValidators([Validators.required, Validators.min(0)]);
        // Si no hay goles, poner 0 por defecto
        if (this.partidoForm.get('golesLocal')?.value === null) {
          this.partidoForm.patchValue({ golesLocal: 0 });
        }
        if (this.partidoForm.get('golesVisitante')?.value === null) {
          this.partidoForm.patchValue({ golesVisitante: 0 });
        }
        break;
      case 'finalizado':
        this.partidoForm.patchValue({
          finalizado: true
        });
        // Habilitar validaciones de goles
        this.partidoForm.get('golesLocal')?.setValidators([Validators.required, Validators.min(0)]);
        this.partidoForm.get('golesVisitante')?.setValidators([Validators.required, Validators.min(0)]);
        // Si no hay goles, poner 0 por defecto
        if (this.partidoForm.get('golesLocal')?.value === null) {
          this.partidoForm.patchValue({ golesLocal: 0 });
        }
        if (this.partidoForm.get('golesVisitante')?.value === null) {
          this.partidoForm.patchValue({ golesVisitante: 0 });
        }
        break;
    }
    // Actualizar validaciones
    this.partidoForm.get('golesLocal')?.updateValueAndValidity();
    this.partidoForm.get('golesVisitante')?.updateValueAndValidity();
  }

  // Método para obtener el estado visual del partido
  getEstadoPartido(partido: Partido): string {
    if (partido.finalizado) {
      return 'Finalizado';
    } else if (partido.golesLocal !== null && partido.golesVisitante !== null) {
      return 'En Juego';
    } else {
      return 'No Empezado';
    }
  }

  // Método para obtener clase CSS según el estado
  getEstadoClase(partido: Partido): string {
    if (partido.finalizado) {
      return 'estado-finalizado';
    } else if (partido.golesLocal !== null && partido.golesVisitante !== null) {
      return 'estado-en-juego';
    } else {
      return 'estado-no-empezado';
    }
  }
  getNombreFecha(id: number): string {
  const fecha = this.fechas.find(f => f.id === id);
  return fecha ? fecha.nombre : id?.toString();
}

getNombreEquipo(id: number): string {
  const equipo = this.equipos.find(e => e.id === id);
  return equipo ? equipo.nombre : id?.toString();
}

  eliminarPartido(id?: number) {
    if (!id) return;
    this.partidoService.eliminarPartido(id).subscribe({
      next: () => {
        this.mensaje = 'Partido eliminado';
        this.cargarPartidos();
      },
      error: () => this.mensaje = 'Error al eliminar'
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.partidoEditandoId = undefined;
    this.partidoForm.reset();
  }

  filtrarPartidos() {
    if (!this.fechaFiltro || this.fechaFiltro === '') {
      this.partidosFiltrados = [...this.partidos];
    } else {
      this.partidosFiltrados = this.partidos.filter(partido => 
        partido.fechaId === Number(this.fechaFiltro)
      );
    }
  }

  // Método para verificar si una fecha ya empezó
  fechaYaEmpezó(fechaId: number): boolean {
    const fecha = this.fechas.find(f => f.id === fechaId);
    return fecha ? fecha.empezada === true : false;
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
}