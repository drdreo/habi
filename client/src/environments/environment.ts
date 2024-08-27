import { AppEnvironment } from "./env.type";

export const environment: AppEnvironment = {
    production: true,
    auth0: {
        domain: "drdreo.eu.auth0.com",
        clientId: "sBu4MMLZKo2G4XbJV3XHnLvkMAyZyGF8",
        audience: "habit-api-dev.drdreo.com"
    },
    origins: {
        api: ""
    }
};
