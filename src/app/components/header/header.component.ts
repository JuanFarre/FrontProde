import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  currentUsername: string | null = null;
  currentUserRole: string | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();
    
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.authStatus$.subscribe(status => {
      this.isUserLoggedIn = status;
      if (status) {
        this.currentUsername = this.authService.getUsername();
        this.currentUserRole = this.authService.getUserRole();
      } else {
        this.currentUsername = null;
        this.currentUserRole = null;
      }
    });
  }
  
  ngOnDestroy(): void {
    // Limpieza al destruir el componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  get isLoggedIn(): boolean {
    return this.isUserLoggedIn;
  }

  get username(): string | null {
    return this.currentUsername;
  }

  get rol(): string | null {
    return this.currentUserRole;
  }

  updateAuthStatus(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getUsername();
    this.currentUserRole = this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }
}
