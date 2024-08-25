type Auth0Config = {
    domain: string;
    clientId: string;
};

export type AppEnvironment = {
    production: boolean;
    auth0: Auth0Config;
};
