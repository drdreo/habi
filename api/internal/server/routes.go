package server

import (
	"encoding/json"
	"log"
	"log/slog"
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
	mux.HandleFunc("/", s.rootHandler)
	mux.HandleFunc("/health", s.healthHandler)
	mux.Handle("GET /api/habits", auth.AuthMiddleware(http.HandlerFunc(s.getHabitsHandler)))
	mux.Handle("GET /api/habits/{id}", auth.AuthMiddleware(http.HandlerFunc(s.getHabitByIdHandler)))
	mux.Handle("POST /api/habits", auth.AuthMiddleware(http.HandlerFunc(s.createHabitHandler)))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"},
		Debug:            true,
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
	slog.Debug("Handling GetHabits request")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habits, err := s.habitService.GetAllHabits(r.Context(), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habits)
}

func (s *Server) getHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling GetHabits request")
	habitId := r.PathValue("id")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habit, err := s.habitService.GetHabitById(r.Context(), userId, habitId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habit)
}

func (s *Server) createHabitHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling CreateHabit request")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habit, err := s.habitService.CreateHabit(r.Context(), userId, r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(habit)
}
