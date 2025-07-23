import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FechaService } from '../../services/fecha.service';
import { Fecha } from '../../models/fecha';
import { TorneoService } from '../../services/torneo.service';
import { Torneo } from '../../models/torneo';
import { MatDialog } from '@angular/material/dialog';
import { DialogEliminarEntidadComponent } from '../../dialog-eliminar-entidad/dialog-eliminar-entidad.component';
import { DialogEditarEntidadComponent } from '../../dialog-editar-entidad/dialog-editar-entidad.component';

@Component({
  selector: 'app-fecha',
  templateUrl: './fecha.component.html',
  styleUrls: ['./fecha.component.css']
})
export class FechaComponent implements OnInit {
  fechas: Fecha[] = [];
  torneos: Torneo[] = [];
  fechaForm: FormGroup;
  editando: boolean = false;
  fechaEditandoId?: number;
  mensaje: string = '';

  constructor(
    private fechaService: FechaService,
    private torneoService: TorneoService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.fechaForm = this.fb.group({
      nombre: ['', Validators.required],
      torneo: [null, Validators.required],
      empezada: [false]
    });
  }

  ngOnInit() {
    this.cargarTorneosYFechas();
  }

  cargarTorneosYFechas() {
    this.torneoService.getTorneos().subscribe(torneos => {
      this.torneos = torneos;
      this.cargarFechas();
    });
  }

  cargarFechas() {
    this.fechaService.getFechas().subscribe(fechas => {
      this.fechas = fechas.map(fecha => {
        if (!fecha.torneo && (fecha as any).torneoId) {
          const torneo = this.torneos.find(t => t.id === (fecha as any).torneoId);
          return { ...fecha, torneo: torneo ?? { id: 0, nombre: 'Sin torneo', anio: 0 } };
        }
        return fecha;
      });
    });
  }

  onSubmit() {
    if (this.fechaForm.invalid) return;

    const formValue = {
      nombre: this.fechaForm.value.nombre,
      torneoId: this.fechaForm.value.torneo.id,
      empezada: this.fechaForm.value.empezada || false
    };

    if (this.editando && this.fechaEditandoId != null) {
      this.fechaService.actualizarFecha(this.fechaEditandoId, formValue).subscribe({
        next: () => {
          this.mensaje = 'Fecha actualizada';
          this.editando = false;
          this.fechaForm.reset();
          this.cargarFechas();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    } else {
      this.fechaService.crearFecha(formValue).subscribe({
        next: () => {
          this.mensaje = 'Fecha creada';
          this.fechaForm.reset();
          this.cargarFechas();
        },
        error: () => this.mensaje = 'Error al crear'
      });
    }
  }

  editarFecha(fecha: Fecha) {
  // Busca el torneo correspondiente en el array de torneos
  const torneoSeleccionado = this.torneos.find(t => t.id === fecha.torneo.id);

  const dialogRef = this.dialog.open(DialogEditarEntidadComponent, {
    width: '350px',
    data: {
      titulo: 'Fecha',
      entidad: { ...fecha, torneo: torneoSeleccionado },
      campos: [
        { nombre: 'nombre', label: 'Nombre', validadores: [Validators.required] },
        { nombre: 'torneo', label: 'Torneo', tipo: 'select', opciones: this.torneos, validadores: [Validators.required] },
        { nombre: 'empezada', label: 'Fecha empezada', tipo: 'checkbox' }
      ]
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const payload = {
        nombre: result.nombre,
        torneoId: result.torneo.id,
        empezada: result.empezada || false
      };

      this.fechaService.actualizarFecha(fecha.id!, payload).subscribe({
        next: () => {
          this.mensaje = 'Fecha actualizada';
          this.cargarFechas();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    }
  });

  }

  eliminarFecha(id?: number, nombre?: string) {
    if (!id) return;
    const dialogRef = this.dialog.open(DialogEliminarEntidadComponent, {
      width: '300px',
      data: { nombre: nombre, titulo: 'Fecha' }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.fechaService.eliminarFecha(id).subscribe({
          next: () => {
            this.mensaje = 'Fecha eliminada';
            this.cargarFechas();
          },
          error: () => this.mensaje = 'Error al eliminar'
        });
      }
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.fechaEditandoId = undefined;
    this.fechaForm.reset();
  }
}