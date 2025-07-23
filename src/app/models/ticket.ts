import { Pronostico } from './pronostico';

export interface Ticket {
  id?: number;
  usuarioId: number;
  fechaId: number;
  fechaCreacion: string; // ISO string
  pronosticos: Pronostico[];
  puntosTotales?: number; // Total de puntos obtenidos en el ticket
}
