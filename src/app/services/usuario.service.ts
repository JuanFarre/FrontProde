import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;
  private usuariosCache = new Map<number, Usuario>();
  private usernamesCache = new Map<number, string>(); // Caché específica para usernames
  private cargandoUsuarios = false;
  private usuariosCargados = false;
  private falloAutorizacion = false;

  constructor(private http: HttpClient) {
    // Cargar usuarios al iniciar el servicio
    this.cargarTodosLosUsuarios();
  }

  getUsuarios(): Observable<Usuario[]> {
    // Si ya intentamos y falló por autorización, devolvemos un array vacío
    if (this.falloAutorizacion) {
      return of([]);
    }

    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`).pipe(
      tap(usuarios => {
        // Guardar todos los usuarios en caché
        usuarios.forEach(usuario => {
          this.usuariosCache.set(usuario.id, usuario);
          
          // Verificar que el username no sea una contraseña hasheada
          if (usuario.username && !this.esPosibleHash(usuario.username)) {
            this.usernamesCache.set(usuario.id, usuario.username);
          } else if (usuario.nombre) {
            // Si el username es un hash pero tenemos un nombre, usamos el nombre
            this.usernamesCache.set(usuario.id, usuario.nombre);
          } else {
            // En último caso, usar un valor predeterminado
            this.usernamesCache.set(usuario.id, `Usuario ${usuario.id}`);
          }
        });
        this.usuariosCargados = true;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.falloAutorizacion = true;
        }
        return of([]);
      })
    );
  }

  // Método para obtener un username de la caché (sin hacer petición al servidor)
  getUsernameCached(id: number): string | null {
    return this.usernamesCache.get(id) || null;
  }

  getUsuarioById(id: number): Observable<Usuario> {
    // Primero verificamos si tenemos el usuario en caché
    if (this.usuariosCache.has(id)) {
      return of(this.usuariosCache.get(id)!);
    }

    // Si ya falló por autorización, devolvemos un usuario predeterminado
    if (this.falloAutorizacion) {
      return of({
        id,
        username: `Usuario ${id}`,
        nombre: 'Desconocido',
        email: ''
      });
    }

    // Si estamos cargando usuarios y aún no ha terminado, usamos un valor temporal
    if (this.cargandoUsuarios && !this.usuariosCargados) {
      return of({
        id,
        username: `Usuario ${id}`,
        nombre: 'Cargando...',
        email: ''
      });
    }

    // Si no está en caché y no estamos cargando usuarios, lo obtenemos del servidor
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`).pipe(
      map(usuario => {
        // Guardamos en caché para futuros usos
        this.usuariosCache.set(id, usuario);
        
        // Verificar que el username no sea una contraseña hasheada
        if (usuario.username && !this.esPosibleHash(usuario.username)) {
          this.usernamesCache.set(id, usuario.username);
        } else if (usuario.nombre) {
          // Si el username es un hash pero tenemos un nombre, usamos el nombre
          this.usernamesCache.set(id, usuario.nombre);
        } else {
          // En último caso, usar un valor predeterminado
          this.usernamesCache.set(id, `Usuario ${id}`);
        }
        
        return usuario;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.falloAutorizacion = true;
        }
        // Devolvemos un usuario con datos predeterminados
        return of({
          id,
          username: `Usuario ${id}`,
          nombre: 'Desconocido',
          email: ''
        });
      })
    );
  }

  // Método para obtener el nombre de usuario (username) a partir del ID
  getUsernameById(id: number): Observable<string> {
    // Primero verificamos si ya tenemos el username en caché
    if (this.usernamesCache.has(id)) {
      return of(this.usernamesCache.get(id)!);
    }
    
    return this.getUsuarioById(id).pipe(
      map(usuario => {
        // Verificar que el username no sea una cadena larga que parezca una contraseña hasheada
        if (usuario.username && !this.esPosibleHash(usuario.username)) {
          this.usernamesCache.set(id, usuario.username);
          return usuario.username;
        } else if (usuario.nombre) {
          // Si el username es un hash pero tenemos un nombre, usamos el nombre
          const nombreCompleto = usuario.nombre;
          this.usernamesCache.set(id, nombreCompleto);
          return nombreCompleto;
        }
        const usernameDefault = `Usuario ${id}`;
        this.usernamesCache.set(id, usernameDefault);
        return usernameDefault;
      })
    );
  }

  // Método para precargar todos los usuarios
  private cargarTodosLosUsuarios(): void {
    this.cargandoUsuarios = true;
    this.getUsuarios().subscribe({
      next: (usuarios) => {
        this.cargandoUsuarios = false;
        this.usuariosCargados = true;
      },
      error: (error) => {
        this.cargandoUsuarios = false;
      }
    });
  }
  
  // Método para determinar si un string parece ser un hash (contraseña hasheada)
  private esPosibleHash(str: string): boolean {
    // Si es una cadena muy larga o contiene patrones típicos de hashes
    return !!(str && (
      str.length > 50 || // Longitud sospechosa
      /^\$2[ayb]\$.{56}$/.test(str) || // Patrón de bcrypt
      /^[0-9a-f]{40}$/i.test(str) || // Patrón de SHA-1
      /^[0-9a-f]{64}$/i.test(str) // Patrón de SHA-256
    ));
  }
}
