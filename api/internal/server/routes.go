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
	mux.Handle("POST /api/habits/{id}/complete", auth.AuthMiddleware(http.HandlerFunc(s.completeHabitByIdHandler)))
	mux.Handle("POST /api/habits/{id}/archive", auth.AuthMiddleware(http.HandlerFunc(s.archiveHabitByIdHandler)))
	mux.Handle("PUT /api/habits/{id}", auth.AuthMiddleware(http.HandlerFunc(s.updateHabitByIdHandler)))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"},
		Debug:            false,
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
		slog.Error("failed to get all habits", "err", err)
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
		slog.Error("failed to get habit", "err", err)
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
		slog.Error("failed to create habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(habit)
}

func (s *Server) updateHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling UpdateHabit request")
	habitId := r.PathValue("id")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habit, err := s.habitService.GetHabitById(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to update habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habit)
}

func (s *Server) completeHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling CompleteHabit request")
	habitId := r.PathValue("id")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habitCompletion, err := s.habitService.CompleteHabitById(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to complete habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habitCompletion)
}

func (s *Server) archiveHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling ArchiveHabit request")
	habitId := r.PathValue("id")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	habit, err := s.habitService.ArchiveHabitById(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to archive habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habit)
}
