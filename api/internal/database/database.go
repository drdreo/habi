package database

import (
	"context"
	"log"
	"log/slog"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	Health() map[string]string
	GetDB() *mongo.Client
}

type service struct {
	db *mongo.Client
}

var (
	host             = os.Getenv("DB_HOST")
	port             = os.Getenv("DB_PORT")
	connectionString = os.Getenv("MONGODB_CONNECTION_STRING")
)

func New() Service {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(connectionString))
	if err != nil {

		log.Fatal(err)

	}
	return &service{
		db: client,
	}
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err := s.db.Ping(ctx, nil)
	if err != nil {
		slog.Error("db down", "err", err)
	}

	return map[string]string{
		"message": "It's healthy",
	}
}

func (s *service) GetDB() *mongo.Client {
	return s.db
}
