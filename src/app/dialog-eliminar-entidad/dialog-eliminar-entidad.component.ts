// dialog-eliminar-entidad.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-eliminar-entidad',
  templateUrl: './dialog-eliminar-entidad.component.html'
})
export class DialogEliminarEntidadComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogEliminarEntidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nombre: string, titulo: string }
  ) {}

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}