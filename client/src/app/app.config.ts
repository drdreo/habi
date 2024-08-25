import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { AuthHttpInterceptor, provideAuth0 } from "@auth0/auth0-angular";

import { environment } from "../environments/environment";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(appRoutes),
        provideHttpClient(),
        provideAuth0({
            domain: environment.auth0.domain,
            clientId: environment.auth0.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin
            },
            httpInterceptor: {
                allowedList: [`${environment.origins.api}/api/*`]
            }
        }),
        provideAnimations(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true }
    ]
};
