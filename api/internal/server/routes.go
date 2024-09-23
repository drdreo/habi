package server

import (
	"encoding/json"
	"log"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	"api/internal/authenticator"
	"api/internal/habits"
	"api/internal/tracking"
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
	mux.Handle("POST /api/habits/demo", auth.AuthMiddleware(http.HandlerFunc(s.addDemoHabitsHandler)))
	mux.Handle("PUT /api/habits/{habitId}", auth.AuthMiddleware(http.HandlerFunc(s.updateHabitByIdHandler)))
	mux.Handle("POST /api/habits/{habitId}/complete", auth.AuthMiddleware(http.HandlerFunc(s.completeHabitByIdHandler)))
	mux.Handle("POST /api/habits/{id}/archive", auth.AuthMiddleware(http.HandlerFunc(s.archiveHabitByIdHandler)))
	mux.Handle("DELETE /api/habits/{id}", auth.AuthMiddleware(http.HandlerFunc(s.deleteHabitByIdHandler)))

	// Tracking routes
	mux.Handle("GET /api/habits/{habitId}/tracking", auth.AuthMiddleware(http.HandlerFunc(s.getTrackingSessionByHabitIdHandler)))
	mux.Handle("POST /api/habits/{habitId}/tracking", auth.AuthMiddleware(http.HandlerFunc(s.createTrackingSessionHandler)))
	mux.Handle("PUT /api/habits/{habitId}/tracking", auth.AuthMiddleware(http.HandlerFunc(s.updateTrackingLocationHandler)))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
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

	allHabits, err := s.habitService.GetAllHabits(r.Context(), userId)
	if err != nil {
		slog.Error("failed to get all habits", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(allHabits)
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

	var habitInput habits.HabitCreateInput
	err := json.NewDecoder(r.Body).Decode(&habitInput)
	if err != nil {
		slog.Error("failed to parse habit input", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	habit, err := s.habitService.CreateHabit(r.Context(), userId, &habitInput)
	if err != nil {
		slog.Error("failed to create habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(habit)
}

func (s *Server) addDemoHabitsHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling AddDemoHabits request")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}
	demoHabits, err := s.habitService.AddDemoHabits(r.Context(), userId)
	if err != nil {
		slog.Error("failed to add demo habits", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(demoHabits)
}

func (s *Server) updateHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling UpdateHabit request")
	habitId := r.PathValue("habitId")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	var habitUpdate habits.HabitUpdateInput
	err := json.NewDecoder(r.Body).Decode(&habitUpdate)
	if err != nil {
		slog.Error("failed to parse habit update", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	habit, err := s.habitService.UpdateHabitById(r.Context(), userId, habitId, &habitUpdate)
	if err != nil {
		slog.Error("failed to update habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habit)
}

func (s *Server) deleteHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling DeleteHabit request")
	habitId := r.PathValue("id")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	err := s.habitService.DeleteHabitById(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to delete habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) completeHabitByIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling CompleteHabit request")
	habitId := r.PathValue("habitId")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	var habitCompletion habits.HabitCompletionInput
	err := json.NewDecoder(r.Body).Decode(&habitCompletion)
	if err != nil {
		slog.Error("failed to parse habit completion", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}


	habit, err := s.habitService.CompleteHabitById(r.Context(), userId, habitId, &habitCompletion)
	if err != nil {
		slog.Error("failed to complete habit", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(habit)
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

func (s *Server) getTrackingSessionByHabitIdHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling GetTrackingSession request")
	habitId := r.PathValue("habitId")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	trackingSession, err := s.trackingService.Get(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to get tracking sessions", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(trackingSession)
}

func (s *Server) createTrackingSessionHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling CreateTrackingSession request")
	habitId := r.PathValue("habitId")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	trackingSession, err := s.trackingService.Create(r.Context(), userId, habitId)
	if err != nil {
		slog.Error("failed to create tracking sessions", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(trackingSession)
}

func (s *Server) updateTrackingLocationHandler(w http.ResponseWriter, r *http.Request) {
	slog.Debug("Handling TrackingLocationUpdate request")
	habitId := r.PathValue("habitId")
	// Extract user ID from context
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		http.Error(w, "failed to get user ID from context", http.StatusUnauthorized)
		return
	}

	var locationUpdate tracking.LocationUpdate
	err := json.NewDecoder(r.Body).Decode(&locationUpdate)
	if err != nil {
		slog.Error("failed to parse location update", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = s.trackingService.UpdateLocation(r.Context(), userId, habitId, locationUpdate)
	if err != nil {
		slog.Error("failed to update tracking location", "err", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
