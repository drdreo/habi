package server

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/rs/cors"
    
    "api/internal/authenticator"
)

type HabitTargetMetric struct {
	 Type  string
	 Value string
}

type Habit struct {
    Name string
    Description string
    Frequency  string
    Type  string
    TargetMetric HabitTargetMetric
}


func (s *Server) RegisterRoutes() http.Handler {
    auth, err := authenticator.New()
    if err != nil {
        log.Fatalf("Failed to initialize the authenticator: %v", err)
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/", http.HandlerFunc(s.rootHandler))
    mux.HandleFunc("/health", s.healthHandler)
    mux.Handle("GET /api/habits/{id}", auth.AuthMiddleware(http.HandlerFunc(s.getHabitsHandler)))
    mux.Handle("POST /api/habits", auth.AuthMiddleware(http.HandlerFunc(s.createHabitHandler)))

    c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowCredentials: true,
        AllowedHeaders:   []string{"Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"},
        Debug: true,
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

func (s *Server) createHabitHandler(w http.ResponseWriter, r *http.Request) {
    log.Printf("Creating habit")
    var h Habit

    err := json.NewDecoder(r.Body).Decode(&h)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    json.NewEncoder(w).Encode(h)
}

