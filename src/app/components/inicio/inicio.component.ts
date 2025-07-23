import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthRequestDto, LoginRequestDto } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnDestroy {
  mostrarLogin = true;
  mostrarRegistro = false;
  registroMsg: string = '';
  registroError: string = '';
  loadingRegistro = false;
  loginMsg: string = '';
  loginError: string = '';
  loadingLogin = false;
  needsVerification = false;
  
  private emailVerificationSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.emailVerificationSubscription = this.authService.emailVerification$.subscribe(
      needsVerification => {
        this.needsVerification = needsVerification;
      }
    );
  }

  ngOnDestroy() {
    if (this.emailVerificationSubscription) {
      this.emailVerificationSubscription.unsubscribe();
    }
  }

  loginUsuario(form: any) {
    if (form.invalid) return;
    this.loadingLogin = true;
    this.loginMsg = '';
    this.loginError = '';
    const { username, password } = form.value;
    const data: LoginRequestDto = { username, password };
    this.authService.login(data).subscribe({
      next: (res) => {
        this.loginMsg = res.message;
        this.loadingLogin = false;
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', username);
          if (res.rol) {
            localStorage.setItem('rol', res.rol);
            if (res.rol === 'ADMIN') {
              this.router.navigate(['/equipos']);
            } else {
              this.router.navigate(['/pronosticos']);
            }
          } else {
            this.router.navigate(['/pronosticos']);
          }
        }
      },
      error: (err) => {
        this.loginError = err;
        this.loadingLogin = false;
      }
    });
  }
  
  mostrarFormulario(tipo: 'login' | 'registro') {
    this.mostrarLogin = tipo === 'login';
    this.mostrarRegistro = tipo === 'registro';
    this.registroMsg = '';
    this.registroError = '';
    this.loginMsg = '';
    this.loginError = '';
    // Resetear el estado de verificación al cambiar de formulario
    this.needsVerification = false;
  }
  
  registrarUsuario(form: any) {
    if (form.invalid) return;
    this.loadingRegistro = true;
    this.registroMsg = '';
    this.registroError = '';
    const { nombre, username, password, email, confirm } = form.value;
    if (password !== confirm) {
      this.registroError = 'Las contraseñas no coinciden';
      this.loadingRegistro = false;
      return;
    }
    const data: AuthRequestDto = { nombre, username, password, email };
    this.authService.registrar(data).subscribe({
      next: (res) => {
        this.registroMsg = res.message || 'Usuario registrado exitosamente';
        this.loadingRegistro = false;
        // Si el registro fue exitoso, mostramos mensaje de verificación de email
        if (res.authStatus === 'USER_CREATED_SUCCESSFULLY') {
          this.needsVerification = true;
        }
      },
      error: (err) => {
        // Mostrar mensaje de error específico según el tipo de error recibido
        if (typeof err === 'string') {
          // Si el mensaje indica que el usuario se creó pero hubo problemas con el correo
          if (err.includes('Usuario registrado correctamente') && 
              err.includes('problema al enviar el correo')) {
            this.registroMsg = 'Usuario registrado correctamente!';
            this.registroError = 'Hubo un problema al enviar el correo de verificación. Por favor, contacta al administrador.';
            this.needsVerification = true;
          } else {
            this.registroError = err;
          }
        } else if (err && err.includes && err.includes('El nombre de usuario ya está en uso')) {
          this.registroError = 'El nombre de usuario ya está registrado. Por favor, elija otro.';
        } else if (err && err.includes && err.includes('El correo electrónico ya está registrado')) {
          this.registroError = 'El correo electrónico ya está registrado. Intente iniciar sesión o recuperar su contraseña.';
        } else if (err && err.includes && err.includes('Error al enviar el correo de verificación')) {
          this.registroMsg = 'Usuario registrado correctamente!';
          this.registroError = 'Hubo un problema al enviar el correo de verificación. Por favor, contacta al administrador.';
          this.needsVerification = true;
        } else {
          this.registroError = 'Error al registrar el usuario. Por favor, intente de nuevo más tarde.';
        }
        this.loadingRegistro = false;
      }
    });
  }
}
