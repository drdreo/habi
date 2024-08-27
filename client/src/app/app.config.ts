import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from "@angular/core";
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from "@angular/material/tooltip";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { authHttpInterceptorFn, provideAuth0 } from "@auth0/auth0-angular";

import { environment } from "../environments/environment";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(appRoutes),
        provideHttpClient(withInterceptors([authHttpInterceptorFn])),
        provideAuth0({
            domain: environment.auth0.domain,
            clientId: environment.auth0.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin + "/app/home",
                audience: environment.auth0.audience
            },
            httpInterceptor: {
                allowedList: [
                    {
                        uri: `${environment.origins.api}/*`
                    }
                ]
            }
        }),
        provideAnimations(),
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {
                showDelay: 450
            }
        }
    ]
};
