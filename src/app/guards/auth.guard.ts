import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Verificar si el usuario está autenticado (ahora isLoggedIn() también verifica si el token está expirado)
    if (this.authService.isLoggedIn()) {
      return true;
    }
    
    // Si no está autenticado, redirigir al inicio
    return this.router.createUrlTree(['/inicio']);
  }
}
