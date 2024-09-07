package server

import (
	"api/internal/habits"
	"api/internal/tracking"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"api/internal/database"
	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	port            int
	db              database.Service
	habitService    habits.Service
	trackingService tracking.Service
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	dbService := database.New()
	habitRepo := habits.NewRepository(dbService.GetDB())
	habitService := habits.NewService(habitRepo)
	trackingRepo := tracking.NewRepository(dbService.GetDB())
	trackingService := tracking.NewService(trackingRepo)

	NewServer := &Server{
		port:            port,
		db:              dbService,
		habitService:    habitService,
		trackingService: trackingService,
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
