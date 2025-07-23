// dialog-editar-entidad.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-editar-entidad',
  templateUrl: './dialog-editar-entidad.component.html'
})
export class DialogEditarEntidadComponent {
  entidadForm: FormGroup;

constructor(
  public dialogRef: MatDialogRef<DialogEditarEntidadComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { entidad: any, campos: any[], titulo: string },
  private fb: FormBuilder
) {
    // Crea el formulario dinámicamente según los campos
    const group: any = {};
    data.campos.forEach(campo => {
      group[campo.nombre] = [data.entidad[campo.nombre] || '', campo.validadores || []];
    });
    this.entidadForm = this.fb.group(group);
  }

  guardar() {
    if (this.entidadForm.valid) {
      this.dialogRef.close(this.entidadForm.value);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}