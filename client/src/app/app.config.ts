import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideExperimentalZonelessChangeDetection } from "@angular/core";
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from "@angular/material/tooltip";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { authHttpInterceptorFn, provideAuth0 } from "@auth0/auth0-angular";

import { environment } from "../environments/environment";
import { appRoutes } from "./app.routes";
import { swBypassInterceptor } from "./sw-bypasst.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(appRoutes),
        provideHttpClient(withInterceptors([authHttpInterceptorFn, swBypassInterceptor])),
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
        provideAnimationsAsync(),
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {
                showDelay: 450
            }
        },
        provideServiceWorker("ngsw-worker.js", {
            enabled: !isDevMode(),
            registrationStrategy: "registerWhenStable:30000"
        })
    ]
};
