import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<Pick<AuthService, 'getAccessToken'>>;
  let next: jasmine.SpyObj<HttpHandlerFn>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getAccessToken']);
    next = jasmine.createSpy('HttpHandlerFn').and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
  });

  it('should add Authorization header when token exists', (done) => {
    authService.getAccessToken.and.returnValue('my-jwt-token');
    const req = new HttpRequest('GET', '/api/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: () => {
          expect(next).toHaveBeenCalled();
          const capturedReq = next.calls.mostRecent().args[0] as HttpRequest<unknown>;
          expect(capturedReq.headers.get('Authorization')).toBe('Bearer my-jwt-token');
          done();
        },
      });
    });
  });

  it('should not add Authorization header when no token', (done) => {
    authService.getAccessToken.and.returnValue(null);
    const req = new HttpRequest('GET', '/api/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: () => {
          expect(next).toHaveBeenCalled();
          const capturedReq = next.calls.mostRecent().args[0] as HttpRequest<unknown>;
          expect(capturedReq.headers.has('Authorization')).toBe(false);
          done();
        },
      });
    });
  });
});
