import { AppEnvironment } from "./env.type";

export const environment: AppEnvironment = {
    production: false,
    auth0: {
        domain: "drdreo-dev.eu.auth0.com",
        clientId: "9z0aHELMGaMt1A1M470K9chvyvMxFq5Q",
        audience: "habit-api-dev.drdreo.com"
    },
    origins: {
        api: "http://localhost:3333"
    }
};
