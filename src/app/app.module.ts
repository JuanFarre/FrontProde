import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // 👈 Asegurate de importar esto
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // 👈 Asegurate de importar esto
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CrearPartidoComponent } from './components/partido/crear-partido/crear-partido.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EquipoComponent } from './components/equipo/equipo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { PartidoComponent } from './components/partido/partido.component';
import { FechaComponent } from './components/fecha/fecha.component';
import { TorneoComponent } from './components/torneo/torneo.component';
import { PronosticoComponent } from './components/pronostico/pronostico.component';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioChange } from '@angular/material/radio';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { DialogEditarEntidadComponent } from './dialog-editar-entidad/dialog-editar-entidad.component';
import { DialogEliminarEntidadComponent } from './dialog-eliminar-entidad/dialog-eliminar-entidad.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { VerificationComponent } from './components/verification/verification.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { RankingComponent } from './components/ranking/ranking.component';
@NgModule({
  declarations: [
    AppComponent,
    CrearPartidoComponent,
    EquipoComponent,
    PartidoComponent,
    FechaComponent,
    TorneoComponent,
    PronosticoComponent,
    UsuarioComponent,
    DialogEditarEntidadComponent,
    DialogEliminarEntidadComponent,
    HeaderComponent,
    FooterComponent,
    InicioComponent,
    TicketComponent,
    VerificationComponent,
    RankingComponent
  ],
  imports: [
    BrowserModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    FormsModule,
    HttpClientModule, 
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule // 👈 Asegurate de importar esto
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
