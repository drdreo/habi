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
	"strconv"
	"time"
)

type Repository interface {
	Create(ctx context.Context, userId string, habit *HabitCreateInput) (*Habit, error)
	GetAll(ctx context.Context, userId string) (*[]Habit, error)
	GetById(ctx context.Context, userId string, habitId string) (*Habit, error)
	UpdateById(ctx context.Context, userId string, habitId string, habitUpdate *HabitUpdateInput) (*Habit, error)
	DeleteById(ctx context.Context, userId string, habitId string) error
	ArchiveById(ctx context.Context, userId string, habitId string) (*Habit, error)
	CompleteById(ctx context.Context, userId string, habitId string) (*Habit, error)
}

type habitRepository struct {
	habitCollection           *mongo.Collection
	habitCompletionCollection *mongo.Collection
}

func NewRepository(db *mongo.Client) Repository {
	var habitCollection = "habits"

	if os.Getenv("MODE") == "development" {
		habitCollection = "dev_habits"
	}

	slog.Info("Using collections: ", "habitCollection", habitCollection)

	return &habitRepository{
		habitCollection: db.Database("habits").Collection(habitCollection),
	}
}

func (r *habitRepository) GetAll(ctx context.Context, userId string) (*[]Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId}

	cursor, err := r.habitCollection.Find(ctx, filter)
	if err != nil {
		slog.Warn("failed to aggregate habit and completions", "err", err)
		return nil, err
	}

	var habits []Habit
	if err = cursor.All(ctx, &habits); err != nil {
		return nil, err
	}

	slog.Info("Successfully got all habits")
	for i, habit := range habits {
		slog.Info("Habit "+strconv.Itoa(i), "habitId", habit.Id, "created_at", habit.CreatedAt, "completions", len(habit.Completions), "name", habit.Name)
	}
	return &habits, nil
}

func (r *habitRepository) GetById(ctx context.Context, userId string, habitId string) (*Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(habitId)
	if err != nil {
		slog.Warn("failed to convert habit Id", "habitId", habitId, "err", err)
		return nil, err
	}
	filter := bson.M{"user_id": userId, "_id": id}

	var habit Habit
	err = r.habitCollection.FindOne(ctx, filter).Decode(&habit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return nil, errors.New("habit not found")
		}
		slog.Warn("failed to get habit", "habitId", habitId, "err", err)
		return nil, err
	}

	slog.Info("Successfully got all habits")
	return &habit, nil
}

func (r *habitRepository) Create(ctx context.Context, userId string, habitInput *HabitCreateInput) (*Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create a Habit struct and populate it with data from HabitCreateInput
	habit := Habit{
		UserId:      userId,
		Name:        habitInput.Name,
		Description: habitInput.Description,
		Frequency:   habitInput.Frequency,
		Type:        habitInput.Type,
		TargetMetric: HabitTargetMetric{
			Type: habitInput.TargetMetric.Type,
			Goal: habitInput.TargetMetric.Goal,
			Unit: habitInput.TargetMetric.Unit,
		},
		Completions: []HabitCompletion{},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	res, err := r.habitCollection.InsertOne(ctx, habit)
	if err != nil {
		slog.Warn("failed to create habit", "err", err)
		return nil, err
	}

	habit.Id = res.InsertedID.(primitive.ObjectID)

	slog.Info("Successfully created habit", "habitId", habit.Id)
	return &habit, nil
}

func (r *habitRepository) UpdateById(ctx context.Context, userId string, habitId string, habit *HabitUpdateInput) (*Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}
	update := bson.D{
		{"$set", habit},
		{"$set", bson.D{
			{"updated_at", time.Now()},
		}},
	}

	slog.Info("Updating habit", "habitId", habitId, "habit", habit)
	var updatedHabit Habit
	err := r.habitCollection.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedHabit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return nil, errors.New("habit not found")
		}
		slog.Warn("failed to update habit", "habitId", habitId, "err", err)
		return nil, err
	}

	slog.Info("Successfully updated habit", "habitId", habitId)
	return &updatedHabit, nil
}

func (r *habitRepository) DeleteById(ctx context.Context, userId string, habitId string) error {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	habitOId, _ := primitive.ObjectIDFromHex(habitId)
	_, err := r.habitCollection.DeleteOne(ctx, bson.M{"_id": habitOId, "user_id": userId})
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return errors.New("habit not found")
		}
		slog.Warn("failed to delete habit", "habitId", habitId, "err", err)
		return err
	}

	slog.Info("Successfully deleted habit", "habitId", habitId)
	return nil
}

func (r *habitRepository) CompleteById(ctx context.Context, userId string, habitId string) (*Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Get current habit target value
	// NOTE: lets not do that just now, if the goal changes while completing and it actually becomes a problem, then store it
	//var habit Habit
	//habitOId, _ := primitive.ObjectIDFromHex(habitId)
	//err := r.habitCollection.FindOne(ctx, bson.M{"_id": habitOId, "user_id": userId}).Decode(&habit)
	//if err != nil {
	//	if errors.Is(err, mongo.ErrNoDocuments) {
	//		slog.Warn("habit not found", "userId", userId, "habitId", habitId)
	//		return nil, errors.New("habit not found")
	//	}
	//	slog.Warn("failed to find habit", "habitId", habitId, "err", err)
	//	return nil, err
	//}

	habitCompletion := HabitCompletion{
		CreatedAt: time.Now(),
	}
	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}
	update := bson.D{
		{"$push", bson.D{
			{"completions", habitCompletion},
		}},
		{"$set", bson.D{
			{"updated_at", time.Now()},
		}},
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedHabit Habit
	err := r.habitCollection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updatedHabit)
	if err != nil {
		slog.Warn("failed to insert habit completion", "habitId", habitId, "err", err)
		return nil, err
	}

	slog.Info("Successfully updated habit", "habitId", updatedHabit.Id)
	return &updatedHabit, nil
}

func (r *habitRepository) ArchiveById(ctx context.Context, userId string, habitId string) (*Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}
	update := bson.D{
		{"$set", bson.D{
			{"archived", true}}},
		{"$set", bson.D{
			{"updated_at", time.Now()},
		}},
	}

	var updatedHabit Habit
	err := r.habitCollection.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedHabit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return nil, errors.New("habit not found")
		}
		slog.Warn("failed to update habit", "habitId", habitId, "err", err)
		return nil, err
	}

	slog.Info("Successfully archived habit", "habitId", habitId)
	return &updatedHabit, nil
}
