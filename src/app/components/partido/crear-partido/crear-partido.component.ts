import { Component, OnInit } from '@angular/core';
import { EquipoService } from 'src/app/services/equipo.service';

@Component({
  selector: 'app-crear-partido',
  templateUrl: './crear-partido.component.html'
})
export class CrearPartidoComponent implements OnInit {
  equipos: any[] = [];
  partido = {
    fechaId: 3,
    equipoLocalId: null,
    equipoVisitanteId: null,
    golesLocal: null,
    golesVisitante: null
  };

  constructor(private equipoService: EquipoService) {}

  ngOnInit(): void {
    this.equipoService.getEquipos().subscribe((data) => {
      this.equipos = data;
    });
  }

  crear() {
    // acá llamás al servicio que crea el partido
  }
}
