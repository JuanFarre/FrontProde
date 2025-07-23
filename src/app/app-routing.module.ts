import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearPartidoComponent } from './components/partido/crear-partido/crear-partido.component';
import { PartidoComponent } from './components/partido/partido.component';
import { EquipoComponent } from './components/equipo/equipo.component'; // Importa el nuevo componente
import { TorneoComponent } from './components/torneo/torneo.component';
import { FechaComponent } from './components/fecha/fecha.component'; // Importa el nuevo componente
import { PronosticoComponent } from './components/pronostico/pronostico.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { InicioComponent } from './components/inicio/inicio.component'; // Importa el componente de inicio
import { VerificationComponent } from './components/verification/verification.component'; // Importa el componente de verificación
import { RankingComponent } from './components/ranking/ranking.component'; // Importa el componente de ranking
import { AuthGuard } from './guards/auth.guard'; // Importamos el guard para autenticación
import { AdminGuard } from './guards/admin.guard'; // Importamos el guard para administradores

const routes: Routes = [
  // Rutas públicas
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'verification', component: VerificationComponent },

  // Rutas autenticadas (usuario logueado)
  { path: 'pronosticos', component: PronosticoComponent, canActivate: [AuthGuard] },
  { path: 'mis-tickets', component: TicketComponent, canActivate: [AuthGuard] },
  { path: 'ranking', component: RankingComponent, canActivate: [AuthGuard] },

  // Rutas de administrador (logueado + rol ADMIN) - SOLO AdminGuard
  { path: 'equipos', component: EquipoComponent, canActivate: [AdminGuard] },
  { path: 'fechas', component: FechaComponent, canActivate: [AdminGuard] },
  { path: 'partidos', component: PartidoComponent, canActivate: [AdminGuard] },
  { path: 'torneos', component: TorneoComponent, canActivate: [AdminGuard] },

  // Ruta comodín
  { path: '**', redirectTo: '/inicio' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }