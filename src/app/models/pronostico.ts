export interface Pronostico {
  id?: number;
  usuarioId: number;
  partidoId: number;
  resultadoPronosticado: string;
  puntosObtenidos: number;
}
