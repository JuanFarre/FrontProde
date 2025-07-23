import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  verificationStatus: string = '';
  message: string = '';
  isLoading: boolean = true;
  token: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.verificationStatus = params['status'] || '';
      
      // Si tenemos un token, verificamos directamente con el backend
      if (this.token) {
        this.verifyEmail();
      } 
      // Si no hay token pero hay un status, mostramos el mensaje correspondiente
      else if (this.verificationStatus) {
        this.showMessageBasedOnStatus();
      } 
      // Si no hay ni token ni status, mostramos un error
      else {
        this.isLoading = false;
        this.verificationStatus = 'error';
        this.message = 'No se proporcionó información de verificación. Por favor, utilice el enlace enviado a su correo electrónico.';
      }
    });
  }

  /**
   * Verifica el email enviando el token al backend
   */
  verifyEmail(): void {
    this.authService.verifyEmail(this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.verificationStatus = 'success';
        this.message = '¡Su cuenta ha sido verificada exitosamente! Ahora puede iniciar sesión.';
      },
      error: (error) => {
        this.isLoading = false;
        
        // Intentamos determinar el tipo de error
        if (error && error.includes && error.includes('expirado')) {
          this.verificationStatus = 'expired';
          this.message = 'El enlace de verificación ha expirado. Por favor, solicite un nuevo enlace.';
        } else if (error && error.includes && error.includes('inválido')) {
          this.verificationStatus = 'invalid-token';
          this.message = 'El token de verificación no es válido. Por favor, verifique el enlace o solicite uno nuevo.';
        } else {
          this.verificationStatus = 'error';
          this.message = 'Ha ocurrido un error durante la verificación. Por favor, inténtelo de nuevo más tarde.';
        }
      }
    });
  }

  /**
   * Muestra un mensaje según el estado de verificación recibido en la URL
   */
  showMessageBasedOnStatus(): void {
    this.isLoading = false;
    
    switch (this.verificationStatus) {
      case 'success':
        this.message = '¡Su cuenta ha sido verificada exitosamente! Ahora puede iniciar sesión.';
        break;
      case 'expired':
        this.message = 'El enlace de verificación ha expirado. Por favor, solicite un nuevo enlace.';
        break;
      case 'invalid-token':
        this.message = 'El token de verificación no es válido. Por favor, verifique el enlace o solicite uno nuevo.';
        break;
      case 'error':
        this.message = 'Ha ocurrido un error durante la verificación. Por favor, inténtelo de nuevo más tarde.';
        break;
      default:
        this.verificationStatus = 'unknown';
        this.message = 'Estado de verificación desconocido. Por favor, contacte al soporte.';
    }
  }

  /**
   * Solicita un nuevo enlace de verificación
   */
  requestNewVerificationLink(): void {
    // Para simplificar, mostramos un diálogo para solicitar el email
    const email = prompt('Por favor, introduce tu email para recibir un nuevo enlace de verificación:');
    
    if (!email) {
      return; // El usuario canceló
    }
    
    this.isLoading = true;
    
    this.authService.requestNewVerificationToken(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Se ha enviado un nuevo enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.');
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.isLoading = false;
        alert('Ha ocurrido un error al solicitar un nuevo enlace. Por favor, intenta de nuevo más tarde.');
      }
    });
  }
}
