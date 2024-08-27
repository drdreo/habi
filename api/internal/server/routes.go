package server

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/rs/cors"
    
    "api/internal/authenticator"
)

func (s *Server) RegisterRoutes() http.Handler {
    auth, err := authenticator.New()
    if err != nil {
        log.Fatalf("Failed to initialize the authenticator: %v", err)
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/", http.HandlerFunc(s.rootHandler))
    mux.HandleFunc("/health", s.healthHandler)
    mux.Handle("GET /api/habits/{id}", auth.AuthMiddleware(http.HandlerFunc(s.getHabitsHandler)))

    c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowCredentials: true,
        AllowedHeaders:   []string{"Authorization"},
	})
    
    return c.Handler(mux)
}

func (s *Server) rootHandler(w http.ResponseWriter, r *http.Request) {
    resp := make(map[string]string)
    resp["message"] = "Hello World"

    jsonResp, err := json.Marshal(resp)
    if err != nil {
        log.Fatalf("error handling JSON marshal. Err: %v", err)
    }

    _, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
    jsonResp, err := json.Marshal(s.db.Health())

    if err != nil {
        log.Fatalf("error handling JSON marshal. Err: %v", err)
    }

    _, _ = w.Write(jsonResp)
}

func (s *Server) getHabitsHandler(w http.ResponseWriter, r *http.Request) {
    log.Printf("Handling habits")
    id := r.PathValue("id")
    fmt.Fprintf(w, "Retrieving post with ID: %s", id)
}
