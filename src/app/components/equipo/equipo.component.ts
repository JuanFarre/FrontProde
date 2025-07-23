import { Component, OnInit } from '@angular/core';
import { EquipoService } from '../../services/equipo.service';
import { Equipo } from '../../models/equipo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditarEntidadComponent } from '../../dialog-editar-entidad/dialog-editar-entidad.component';
import { DialogEliminarEntidadComponent } from '../../dialog-eliminar-entidad/dialog-eliminar-entidad.component';


@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.css']
})
export class EquipoComponent implements OnInit {
  equipos: Equipo[] = [];
  equipoForm: FormGroup;
  editando: boolean = false;
  equipoEditandoId?: number;
  mensaje: string = '';
  mostrarFormularioCrear: boolean = false;

  constructor(
    private equipoService: EquipoService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.equipoForm = this.fb.group({
      nombre: ['', Validators.required],
      ciudad: ['', Validators.required],
      escudoUrl: ['']
    });
  }

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe(equipos => this.equipos = equipos);
  }

  crearEquipo() {
    if (this.equipoForm.invalid) return;

    this.equipoService.crearEquipo(this.equipoForm.value).subscribe({
      next: () => {
        this.mensaje = 'Equipo creado correctamente';
        this.equipoForm.reset();
        this.cargarEquipos();
        this.mostrarFormularioCrear = false;
      },
      error: (error) => {
        this.mensaje = 'Error al crear el equipo: ' + (error.message || 'Error desconocido');
      }
    });
  }

abrirDialogoEditar(equipo: Equipo) {
  const dialogRef = this.dialog.open(DialogEditarEntidadComponent, {
    width: '350px',
    data: {
      titulo: 'Equipo',
      entidad: equipo,
      campos: [
        { nombre: 'nombre', label: 'Nombre', validadores: [Validators.required] },
        { nombre: 'ciudad', label: 'Ciudad', validadores: [Validators.required] },
        { nombre: 'escudoUrl', label: 'URL del escudo', validadores: [] }
      ]
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.equipoService.actualizarEquipo(equipo.id!, result).subscribe({
        next: () => {
          this.mensaje = 'Equipo actualizado';
          this.cargarEquipos();
        },
        error: () => this.mensaje = 'Error al actualizar'
      });
    }
  });
}

abrirDialogoEliminar(equipo: Equipo) {
  const dialogRef = this.dialog.open(DialogEliminarEntidadComponent, {
    width: '300px',
    data: { nombre: equipo.nombre, titulo: 'Equipo' }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.equipoService.eliminarEquipo(equipo.id!).subscribe({
        next: () => {
          this.mensaje = 'Equipo eliminado';
          this.cargarEquipos();
        },
        error: () => this.mensaje = 'Error al eliminar'
      });
    }
  });
}
}