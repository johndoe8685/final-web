import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateService, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { lastValueFrom } from 'rxjs';

import { routes } from './app.routes';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function appInitializerFactory(translate: TranslateService) {
  return () => {
    translate.addLangs(['en', 'tr']);
    translate.setDefaultLang('en');

    const storedLang = localStorage.getItem('language');
    const browserLang = translate.getBrowserLang() || 'en';
    let langToUse: string;
    if (storedLang && ['en', 'tr'].includes(storedLang)) {
        langToUse = storedLang;
    } else {
        langToUse = browserLang.match(/en|tr/) ? browserLang : 'en';
    }

    return lastValueFrom(translate.use(langToUse));
  };
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })),

    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    }
  ]
};