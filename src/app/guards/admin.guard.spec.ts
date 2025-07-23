import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUserRole']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow authenticated admin users to access routes', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('ADMIN');
    
    expect(guard.canActivate(null!, null!)).toEqual(true);
  });

  it('should redirect authenticated non-admin users to inicio', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('USER');
    
    const result = guard.canActivate(null!, null!);
    expect(result).not.toEqual(true);
  });

  it('should redirect unauthenticated users to inicio', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    
    const result = guard.canActivate(null!, null!);
    expect(result).not.toEqual(true);
  });
});
