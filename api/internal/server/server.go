package server

import (
	"api/internal/habits"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"api/internal/database"
	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	port         int
	db           database.Service
	habitService habits.Service
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	dbService := database.New()
	habitRepo := habits.NewHabitRepository(dbService.GetDB())
	habitService := habits.NewService(habitRepo)

	NewServer := &Server{
		port:         port,
		db:           dbService,
		habitService: habitService,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
