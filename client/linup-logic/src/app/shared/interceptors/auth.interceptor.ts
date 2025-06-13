import { Injectable, inject } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && (!req.url.includes('/login') || !req.url.includes('/signup'))) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.getToken();
            const newReq = req.clone({ setHeaders: { Authorization: `${newToken}` } });
            return next(newReq);
          }),
          catchError(err => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

// Class-based interceptor for module-based applications
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && (!req.url.includes('/login') || !req.url.includes('/signup'))) {
          return this.auth.refreshToken().pipe(
            switchMap(() => {
              const newToken = this.auth.getToken();
              const newReq = req.clone({ setHeaders: { Authorization: `${newToken}` } });
              return next.handle(newReq);
            }),
            catchError(err => {
              this.auth.logout();
              return throwError(() => err);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
