import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AUTH_API } from './auth-api.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let localStorageSpy: Record<string, string>;

  beforeEach(() => {
    localStorageSpy = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => localStorageSpy[key] ?? null);
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => {
      localStorageSpy[key] = value;
    });
    spyOn(Storage.prototype, 'removeItem').and.callFake((key: string) => {
      delete localStorageSpy[key];
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate'), createUrlTree: jasmine.createSpy('createUrlTree') } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated when no token', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
  });

  it('login should POST to login URL and set session on success', () => {
    const body = { email: 'jane@example.com', password: 'pass123' };
    const response = {
      success: true,
      message: 'OK',
      data: {
        accessToken: 'jwt-123',
        tokenType: 'Bearer',
        id: 1,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        emailVerified: true,
        roles: ['USER'],
      },
    };

    service.login(body).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.data?.accessToken).toBe('jwt-123');
    });

    const req = httpMock.expectOne(AUTH_API.login);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(response);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('jwt-123');
    expect(service.currentUser()?.email).toBe('jane@example.com');
  });

  it('login should not set session when success is false', () => {
    const body = { email: 'jane@example.com', password: 'wrong' };
    const response = { success: false, message: 'Invalid credentials', data: null };

    service.login(body).subscribe((res) => {
      expect(res.success).toBe(false);
    });

    const req = httpMock.expectOne(AUTH_API.login);
    req.flush(response);

    expect(service.isAuthenticated()).toBe(false);
  });

  it('signup should POST to signup URL and set session on success', () => {
    const body = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'pass123',
    };
    const response = {
      success: true,
      message: 'Registered',
      data: {
        accessToken: 'jwt-456',
        tokenType: 'Bearer',
        id: 2,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        emailVerified: false,
        roles: ['USER'],
      },
    };

    service.signup(body).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(AUTH_API.signup);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(response);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('jwt-456');
  });

  it('verifyEmail should GET verify-email with token', () => {
    const token = 'abc-verification-token';
    const response = { success: true, message: 'Email verified', data: null };

    service.verifyEmail(token).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(AUTH_API.verifyEmail(token));
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('logout should clear session and navigate to signin', () => {
    (router.navigate as jasmine.Spy).calls.reset();
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/signin']);
  });

  it('clearSession should clear token and user', () => {
    const body = { email: 'a@b.com', password: 'p' };
    const response = {
      success: true,
      message: 'OK',
      data: {
        accessToken: 't',
        tokenType: 'Bearer',
        id: 1,
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        emailVerified: false,
        roles: [],
      },
    };
    service.login(body).subscribe();
    httpMock.expectOne(AUTH_API.login).flush(response);
    expect(service.isAuthenticated()).toBe(true);

    service.clearSession();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
