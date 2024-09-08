package tracking

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
	Create(ctx context.Context, userId string, habitId string) (*Tracking, error)
	UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error
	Get(ctx context.Context, userId string, habitId string) (*Tracking, error)
}

type trackingRepository struct {
	trackingCollection *mongo.Collection
}

func NewRepository(db *mongo.Client) Repository {
	var trackingCollection = "tracking_sessions"
	if os.Getenv("MODE") == "development" {
		trackingCollection = "dev_tracking_sessions"
	}

	slog.Info("Using collection: ", "trackingCollection", trackingCollection)

	return &trackingRepository{
		trackingCollection: db.Database("habits").Collection(trackingCollection),
	}
}


func (r *trackingRepository) Get(ctx context.Context, userId string, habitId string) (*Tracking, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	habitOId, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "habit_id": habitOId}
	opts:= options.FindOne().SetSort(bson.D{{"created_at", -1}})

	var trackingSess Tracking
	err := r.trackingCollection.FindOne(ctx, filter, opts).Decode(&trackingSess)
	if err != nil {
		slog.Warn("failed to get tracking session", "err", err)
		return nil, err
	}

	slog.Info("Successfully got tracking session")
	return &trackingSess, nil
}

func (r *trackingRepository) Create(ctx context.Context, userId string, habitId string) (*Tracking, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	habitOId, _ := primitive.ObjectIDFromHex(habitId)
	trackingSess := Tracking{
		UserId:  userId,
		HabitId: habitOId,
		Location: Location{
			Type:        "LineString",
			Coordinates: [][]float64{},
		},
		StartTime: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := r.trackingCollection.InsertOne(ctx, trackingSess)
	if err != nil {
		slog.Warn("failed to insert tracking session", "err", err)
		return nil, err
	}

	slog.Info("Successfully created tracking sessions")
	return &trackingSess, nil
}

func (r *trackingRepository) UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	hOId, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "habit_id": hOId}

	// Convert Coordinates to [][]float64
	var coordinates [][]float64
	for _, coord := range locationUpdate.Coordinates {
		var coords []float64
		coords = append(coords, coord.Lng, coord.Lat)
		if coord.Altitude != nil {
			coords = append(coords, *coord.Altitude)
		}

		coordinates = append(coordinates, coords)
	}

	update := bson.D{
		{"$push", bson.D{
			{"location.coordinates", bson.D{
				{"$each", coordinates},
			}},
		}},
		{"$set", bson.D{
			{"updated_at", time.Now()},
		}},
	}
	opts := options.FindOneAndUpdate().SetSort(bson.D{{"created_at", -1}}).SetReturnDocument(options.After)

	var updatedTracking Tracking
	err := r.trackingCollection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updatedTracking)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("tracking session not found", "userId", userId, "habitId", habitId)
			return errors.New("tracking session not found")
		}
		slog.Warn("failed to update tracking session", "err", err)
		return err
	}

	slog.Info("Successfully updated tracking location")
	return nil
}
