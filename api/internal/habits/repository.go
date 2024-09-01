package habits

import (
	"context"
	"errors"
	"os"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"log/slog"
	"time"
)

type Repository interface {
	Create(ctx context.Context, habit HabitInput) (Habit, error)
	GetAll(ctx context.Context, userId string) ([]Habit, error)
	GetById(ctx context.Context, userId string, habitId string) (Habit, error)
}

type habitRepository struct {
	collection *mongo.Collection
}

func NewHabitRepository(db *mongo.Client) Repository {
	var collection = "habits"
	if os.Getenv("MODE") == "development" {
		collection = "dev_habits"
	}
	return &habitRepository{
		collection: db.Database("habits").Collection(collection),
	}
}

func (r *habitRepository) GetAll(ctx context.Context, userId string) ([]Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := r.collection.Find(ctx, bson.M{"user_id": userId})
	if err != nil {
		slog.Warn("failed to insert habit", "err", err)
		return nil, err
	}
	// get all habits for the user as slice
	var habits []Habit
	if err = res.All(ctx, &habits); err != nil {
		slog.Warn("failed to get all", "err", err)
		return nil, err
	}

	slog.Info("Successfully got all habits")
	return habits, nil
}

func (r *habitRepository) GetById(ctx context.Context, userId string, habitId string) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId, "_id": habitId}

	var habit Habit
	err := r.collection.FindOne(ctx, filter).Decode(&habit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return Habit{}, errors.New("habit not found")
		}
		slog.Warn("failed to get habit", "err", err)
		return Habit{}, err
	}

	slog.Info("Successfully got all habits")
	return habit, nil
}

func (r *habitRepository) Create(ctx context.Context, habitInput HabitInput) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create a Habit struct and populate it with data from HabitInput
	habit := Habit{
		UserId:      habitInput.UserId,
		Name:        habitInput.Name,
		Description: habitInput.Description,
		Frequency:   habitInput.Frequency,
		Type:        habitInput.Type,
		TargetMetric: HabitTargetMetric{
			Type:  habitInput.TargetMetric.Type,
			Value: habitInput.TargetMetric.Value,
		},
		CreatedAt: time.Now(),
	}

	res, err := r.collection.InsertOne(ctx, habit)
	if err != nil {
		slog.Warn("failed to insert habit", "err", err)
		return Habit{}, err
	}

	habit.Id = res.InsertedID.(primitive.ObjectID)

	slog.Info("Successfully inserted habit into MongoDB")
	return habit, nil
}
