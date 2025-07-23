import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private previousUrl: string = '/inicio';
  private currentUrl: string = '/inicio';

  constructor(private router: Router) {
    // Inicializar con la URL actual si está disponible
    this.currentUrl = this.router.url || '/inicio';
    
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      });
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }

  public getCurrentUrl(): string {
    return this.currentUrl;
  }

  public navigateToPrevious(): void {
    this.router.navigateByUrl(this.previousUrl);
  }
}
