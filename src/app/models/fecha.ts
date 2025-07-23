import { Torneo } from './torneo';

export interface Fecha {
  id?: number;
  nombre: string;
  torneo: Torneo; // Relación obligatoria
  empezada?: boolean; // Nueva propiedad para controlar pronósticos
}