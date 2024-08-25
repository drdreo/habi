import { AppEnvironment } from "./env.type";

export const environment: AppEnvironment = {
    production: true,
    auth0: {
        domain: "",
        clientId: ""
    },
    origins: {
        api: ""
    }
};
