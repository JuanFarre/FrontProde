import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Si no está autenticado, redirigir al inicio
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/inicio']);
    }
    
    // Si está autenticado pero no es ADMIN, cancelar navegación usando history
    if (this.authService.getUserRole() !== 'ADMIN') {
      
      // Usar history.back() de forma asíncrona para evitar conflictos
      setTimeout(() => {
        window.history.back();
      }, 0);
      
      return false;
    }
    
    // Si es ADMIN, permitir acceso
    return true;
  }
}