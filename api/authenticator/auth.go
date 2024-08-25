package authenticator

import (
    "context"
    "errors"
    "log"
    "net/http"
    "os"
    "strings"

    "github.com/coreos/go-oidc/v3/oidc"
    "golang.org/x/oauth2"
)

// Authenticator is used to authenticate our users.
type Authenticator struct {
    *oidc.Provider
    oauth2.Config
}

// New instantiates the *Authenticator.
func New() (*Authenticator, error) {
    provider, err := oidc.NewProvider(
        context.Background(),
        os.Getenv("AUTH0_DOMAIN"),
    )
    if err != nil {
        return nil, err
    }

    conf := oauth2.Config{
        ClientID:     os.Getenv("AUTH0_AUDIENCE"),
        Endpoint:     provider.Endpoint(),
        Scopes:       []string{oidc.ScopeOpenID, "profile"},
    }

    return &Authenticator{
        Provider: provider,
        Config:   conf,
    }, nil
}


// AuthMiddleware creates a middleware that authenticates requests.
func (a *Authenticator) AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Authorization header missing", http.StatusUnauthorized)
            return
        }

        // Extract token from header
        token := strings.TrimPrefix(authHeader, "Bearer ")
        if token == authHeader { // means no Bearer prefix was found
            http.Error(w, "Authorization header format must be Bearer {token}", http.StatusUnauthorized)
            return
        }

        // Verify the token
        idToken, err := a.verifyBearerToken(r.Context(), token)
        if err != nil {
            http.Error(w, "Invalid token: " + err.Error(), http.StatusUnauthorized)
            return
        }

        // Token is valid, pass the user info into the request context
        r = r.WithContext(context.WithValue(r.Context(), "user", idToken))
        next.ServeHTTP(w, r)
    })
}

// verifyToken validates the provided JWT token using the OIDC verifier.
func (a *Authenticator) verifyBearerToken(ctx context.Context, token string) (*oidc.IDToken, error) {
    oidcConfig := &oidc.Config{
        ClientID: a.Config.ClientID,
    }

    verifier := a.Provider.Verifier(oidcConfig)
    idToken, err := verifier.Verify(ctx, token)
    if err != nil {
        return nil, err
    }

    return idToken, nil
}

// VerifyIDToken verifies that an *oauth2.Token is a valid *oidc.IDToken.
func (a *Authenticator) VerifyIDToken(ctx context.Context, token *oauth2.Token) (*oidc.IDToken, error) {
    rawIDToken, ok := token.Extra("id_token").(string)
    if !ok {
        return nil, errors.New("no id_token field in oauth2 token")
    }

    oidcConfig := &oidc.Config{
        ClientID: a.ClientID,
    }

    return a.Verifier(oidcConfig).Verify(ctx, rawIDToken)
}
