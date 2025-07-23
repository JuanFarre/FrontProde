export interface Partido {
  id?: number;
    fechaId: number;
    equipoLocalId: number;
    equipoVisitanteId: number;
    golesLocal?: number;
    golesVisitante?: number;
    finalizado?: boolean;
}