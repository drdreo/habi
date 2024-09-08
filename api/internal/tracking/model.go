package tracking

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type CoordinateInput struct {
	Lat      float64  `json:"lat"`
	Lng      float64  `json:"lng"`
	Accuracy *float64 `json:"accuracy"`
	Altitude *float64 `json:"altitude"`
}

type LocationUpdate struct {
	Timestamp   time.Time         `json:"timestamp"`
	Coordinates []CoordinateInput `json:"coordinates"`
}

type Location struct {
	Type        string      `json:"type" bson:"type"`
	Coordinates [][]float64 `json:"coordinates" bson:"coordinates"`
}

type Tracking struct {
	UserId  string             `json:"-" bson:"user_id"`
	HabitId primitive.ObjectID `json:"habitId" bson:"habit_id"`

	StartTime     time.Time      `json:"startTime" bson:"start_time"`
	EndTime       *time.Time     `json:"endTime" bson:"end_time"`
	TotalDistance *int           `json:"totalDistance" bson:"total_distance"`
	TotalDuration *time.Duration `json:"totalDuration" bson:"total_duration"`
	Location      Location       `json:"location" bson:"location"`
	// Mongo related stuff
	Id        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}
