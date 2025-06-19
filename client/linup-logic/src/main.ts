import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from "./app/shared/interceptors/auth.interceptor";
import {provideRouter} from "@angular/router";
import {routes} from "./app/app.routes";
import { BASE_PATH } from './app/services/generated/variables';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    { provide: BASE_PATH, useValue: environment.API_BASE_PATH }
  ]
});
