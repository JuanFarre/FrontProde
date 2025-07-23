import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isTokenExpired']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow authenticated users to access routes', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.isTokenExpired.and.returnValue(false);
    
    expect(guard.canActivate(null!, null!)).toEqual(true);
  });

  it('should redirect unauthenticated users to inicio', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.isTokenExpired.and.returnValue(true);
    
    const result = guard.canActivate(null!, null!);
    expect(result).not.toEqual(true);
  });
});
