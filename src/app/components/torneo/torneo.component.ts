import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TorneoService } from '../../services/torneo.service';
import { Torneo } from '../../models/torneo';
import { MatDialog } from '@angular/material/dialog';
import { DialogEliminarEntidadComponent } from '../../dialog-eliminar-entidad/dialog-eliminar-entidad.component';
import { DialogEditarEntidadComponent } from 'src/app/dialog-editar-entidad/dialog-editar-entidad.component';
@Component({
  selector: 'app-torneo',
  templateUrl: './torneo.component.html',
  styleUrls: ['./torneo.component.css']
})
export class TorneoComponent implements OnInit {
  torneos: Torneo[] = [];
  torneoForm: FormGroup;
  editando: boolean = false;
  torneoEditandoId?: number;
  mensaje: string = '';

  constructor(
    private torneoService: TorneoService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.torneoForm = this.fb.group({
      nombre: ['', Validators.required],
      anio: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]]
    });
  }

  ngOnInit() {
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.torneoService.getTorneos().subscribe(torneos => this.torneos = torneos);
  }

  onSubmit() {
    if (this.torneoForm.invalid) return;

    if (this.editando && this.torneoEditandoId != null) {
      this.torneoService.actualizarTorneo(this.torneoEditandoId, this.torneoForm.value).subscribe({
        next: () => {
          this.mensaje = 'Torneo actualizado';
          this.editando = false;
          this.torneoForm.reset();
          this.cargarTorneos();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    } else {
      this.torneoService.crearTorneo(this.torneoForm.value).subscribe({
        next: () => {
          this.mensaje = 'Torneo creado';
          this.torneoForm.reset();
          this.cargarTorneos();
        },
        error: () => this.mensaje = 'Error al crear'
      });
    }
  }

editarTorneo(torneo: Torneo) {
  const dialogRef = this.dialog.open(DialogEditarEntidadComponent, {
    width: '350px',
    data: {
      titulo: 'Torneo',
      entidad: torneo,
      campos: [
        { nombre: 'nombre', label: 'Nombre', validadores: [Validators.required] },
        { nombre: 'anio', label: 'Año', tipo: 'number', validadores: [Validators.required] }
      ]
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.torneoService.actualizarTorneo(torneo.id!, result).subscribe({
        next: () => {
          this.mensaje = 'Torneo actualizado';
          this.cargarTorneos();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    }
  });
}
  eliminarTorneo(id?: number, nombre?: string) {
    if (!id) return;
    const dialogRef = this.dialog.open(DialogEliminarEntidadComponent, {
      width: '300px',
      data: { nombre: nombre, titulo: 'Torneo' }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.torneoService.eliminarTorneo(id).subscribe({
          next: () => {
            this.mensaje = 'Torneo eliminado';
            this.cargarTorneos();
          },
          error: () => this.mensaje = 'Error al eliminar'
        });
      }
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.torneoEditandoId = undefined;
    this.torneoForm.reset();
  }
}