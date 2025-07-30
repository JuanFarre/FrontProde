import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthRequestDto {
  nombre: string;
  username: string;
  password: string;
  email: string;
}

export interface AuthResponseDto {
  token: string | null;
  authStatus: string;
  message: string;
  rol?: string;
  userId?: number;
  needsVerification?: boolean;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

interface DecodedToken {
  jti: string;
  iss: string;
  sub: string;
  rol: string;
  userId: number;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/registrar`;
  private loginUrl = `${environment.apiUrl}/auth/login`;
  private verifyEmailUrl = `${environment.apiUrl}/auth/verifyEmail`;
  private readonly TOKEN_KEY = 'token';
  
  // Subject para emitir cambios en el estado de autenticación
  private authStatusSubject = new BehaviorSubject<boolean>(this.checkInitialAuthStatus());
  public authStatus$ = this.authStatusSubject.asObservable();
  
  // Subject para notificar cuando un usuario necesita verificar su correo
  private emailVerificationSubject = new BehaviorSubject<boolean>(false);
  public emailVerification$ = this.emailVerificationSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar token periódicamente
    setInterval(() => {
      const currentStatus = this.isLoggedIn();
      if (this.authStatusSubject.value !== currentStatus) {
        this.authStatusSubject.next(currentStatus);
      }
    }, 30000); // Verificar cada 30 segundos
  }
  
  private checkInitialAuthStatus(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken = this.decodeToken();
      if (!decodedToken) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp > currentTime;
    } catch (e) {
      return false;
    }
  }

  registrar(data: AuthRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(this.apiUrl, data).pipe(
      tap(response => {
        // Si el registro fue exitoso y necesita verificación, notificamos
        if (response.authStatus === 'USER_CREATED_SUCCESSFULLY') {
          this.emailVerificationSubject.next(true);
        }
      }),
      catchError(error => {
        // Si el error contiene información sobre problemas con el correo, 
        // pero el usuario se creó correctamente, aún permitimos la verificación
        if (error.error && error.error.message && 
            error.error.message.includes('Error al enviar el correo') &&
            error.error.authStatus === 'USER_CREATED_SUCCESSFULLY') {
          
          // Activamos la notificación de verificación de email
          this.emailVerificationSubject.next(true);
          
          // Devolvemos un error personalizado
          return throwError(() => 'Usuario registrado correctamente, pero hubo un problema al enviar el correo de verificación. Por favor, contacta al administrador.');
        }
        
        // Para otros errores, usamos el manejador de errores estándar
        return this.handleError(error);
      })
    );
  }

  login(data: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(this.loginUrl, data).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          // Notificar sobre el cambio en el estado de autenticación
          this.authStatusSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Método para verificar email con el token recibido
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.verifyEmailUrl}?token=${token}`).pipe(
      catchError(this.handleError)
    );
  }
  
  // Método para solicitar un nuevo token de verificación
  requestNewVerificationToken(email: string): Observable<any> {
    return this.http.post(`${this.verifyEmailUrl}/resend`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Método para redirigir a la página de verificación con el estado adecuado
  redirectToVerification(status: string): void {
    // Usar la URL actual del navegador para mantener el dominio correcto
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/verification?status=${status}`;
  }

  // Decodifica el token JWT sin dependencias externas
  private decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // El token JWT tiene tres partes separadas por punto: header.payload.signature
      const payload = token.split('.')[1];
      // Decodificamos la parte del payload (está en base64)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    const decodedToken = this.decodeToken();
    
    if (decodedToken && decodedToken.userId) {
      return decodedToken.userId;
    }
    
    // Si no podemos obtener el ID del token, usamos un valor por defecto para desarrollo
    return 3; // Valor predeterminado para desarrollo
  }

  getUserRole(): string | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.rol || null;
  }

  getUsername(): string | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.sub || null;
  }

  isLoggedIn(): boolean {
    // Verifica si existe un token Y que no haya expirado
    return !!this.getToken() && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const decodedToken = this.decodeToken();
    if (!decodedToken) return true;
    
    // Comparamos la fecha de expiración con la fecha actual
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Notificar sobre el cambio en el estado de autenticación
    this.authStatusSubject.next(false);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 409) {
      // Error de conflicto (usuario o email ya existen)
      return throwError(() => error.error?.message || 'El usuario o email ya existen');
    } else if (error.status === 0) {
      // Error de conexión al servidor
      return throwError(() => 'No se pudo conectar con el servidor. Verifique su conexión a internet');
    } else if (error.status === 500) {
      // Error interno del servidor
      return throwError(() => 'Error en el servidor. Por favor, intente más tarde');
    }
    
    // Devolver el mensaje de error específico si existe, o un mensaje genérico
    return throwError(() => error.error?.message || 'Error en la solicitud');
  }
}
