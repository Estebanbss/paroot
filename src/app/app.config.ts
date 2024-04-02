import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient,withFetch  } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),

    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(
      HttpClientModule,
      CookieService,

    ),
  ]
};
