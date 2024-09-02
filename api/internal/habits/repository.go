package habits

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log/slog"
	"os"
	"time"
)

type Repository interface {
	Create(ctx context.Context, userId string, habit HabitInput) (Habit, error)
	GetAll(ctx context.Context, userId string) ([]Habit, error)
	GetById(ctx context.Context, userId string, habitId string) (Habit, error)
	ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error)
	CompleteById(ctx context.Context, userId string, habitId string) (HabitCompletion, error)
}

type habitRepository struct {
	habitCollection           *mongo.Collection
	habitCompletionCollection *mongo.Collection
}

func NewHabitRepository(db *mongo.Client) Repository {
	var habitCollection = "habits"
	if os.Getenv("MODE") == "development" {
		habitCollection = "dev_habits"
	}
	var habitCompletionCollection = "habit_completions"
	if os.Getenv("MODE") == "development" {
		habitCompletionCollection = "dev_habit_completions"
	}
	return &habitRepository{
		habitCollection:           db.Database("habits").Collection(habitCollection),
		habitCompletionCollection: db.Database("habits").Collection(habitCompletionCollection),
	}
}

func (r *habitRepository) GetAll(ctx context.Context, userId string) ([]Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := r.habitCollection.Find(ctx, bson.M{"user_id": userId})
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

	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}

	var habit Habit
	err := r.habitCollection.FindOne(ctx, filter).Decode(&habit)
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

func (r *habitRepository) Create(ctx context.Context, userId string, habitInput HabitInput) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create a Habit struct and populate it with data from HabitInput
	habit := Habit{
		UserId:      userId,
		Name:        habitInput.Name,
		Description: habitInput.Description,
		Frequency:   habitInput.Frequency,
		Type:        habitInput.Type,
		TargetMetric: HabitTargetMetric{
			Type:  habitInput.TargetMetric.Type,
			Value: habitInput.TargetMetric.Value,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	res, err := r.habitCollection.InsertOne(ctx, habit)
	if err != nil {
		slog.Warn("failed to insert habit", "err", err)
		return Habit{}, err
	}

	habit.Id = res.InsertedID.(primitive.ObjectID)

	slog.Info("Successfully inserted habit into MongoDB")
	return habit, nil
}

func (r *habitRepository) CompleteById(ctx context.Context, userId string, habitId string) (HabitCompletion, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create a Habit struct and populate it with data from HabitInput
	habitCompletion := HabitCompletion{
		HabitId:   habitId,
		UserId:    userId,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := r.habitCompletionCollection.InsertOne(ctx, habitCompletion)
	if err != nil {
		slog.Warn("failed to insert habit completion", "err", err)
		return HabitCompletion{}, err
	}

	slog.Info("Successfully inserted habit completion")
	return habitCompletion, nil
}

func (r *habitRepository) ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}
	update := bson.D{{"$set", bson.D{{"archived", true}}}}

	var updatedHabit Habit
	err := r.habitCollection.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedHabit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return Habit{}, errors.New("habit not found")
		}
		slog.Warn("failed to update habit", "err", err)
		return Habit{}, err
	}

	slog.Info("Successfully archived habit")
	return updatedHabit, nil
}
