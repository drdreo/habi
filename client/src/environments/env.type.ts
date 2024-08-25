type Auth0Config = {
    domain: string;
    clientId: string;
};

type Origins = {
    api: string;
};

export type AppEnvironment = {
    production: boolean;
    auth0: Auth0Config;
    origins: Origins;
};
