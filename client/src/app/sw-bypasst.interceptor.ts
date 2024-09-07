import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * See https://angular.dev/ecosystem/service-workers/devops#bypassing-the-service-worker for more info.
 * This interceptor is used to bypass the service worker when making HTTP requests as there are some cases where the service worker might run into issues.
 * Since we are not using the service worker for caching HTTP requests, we can safely bypass it.
 * Attention: make sure that this header is explicitly allowed (e.g. by your file storage provider else file fetches might fail due to CORS).
 */

export function swBypassInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    // keep service worker for HabiAPI
    if (req.url.includes("/api")) {
        return next(req);
    }

    const newRequest = req.clone({ headers: req.headers.append("ngsw-bypass", "true") });
    return next(newRequest);
}
