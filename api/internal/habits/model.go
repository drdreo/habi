package habits

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type HabitTargetMetricInput struct {
	Type  string
	Value string
}

type HabitInput struct {
	Name         string
	Description  string
	Frequency    string
	Type         string
	TargetMetric HabitTargetMetricInput
}

type HabitTargetMetric struct {
	Type  string `bson:"metric"`
	Value string `bson:"value"`
}

type Habit struct {
	Name         string            `json:"name" bson:"name"`
	Description  string            `json:"description" bson:"description"`
	Frequency    string            `json:"frequency" bson:"frequency"`
	Type         string            `json:"type" bson:"type"`
	TargetMetric HabitTargetMetric `json:"target_metric" bson:"target_metric"`
	Archived     *bool             `json:"archived" bson:"archived"` // optional
	// Mongo related stuff
	Id         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	ModifiedAt time.Time          `json:"modified_at" bson:"modified_at"`
	UserId     string             `json:"-" bson:"user_id"`
}

type HabitCompletion struct {
	HabitId string `json:"habitId" bson:"habit_id"`
	UserId  string `json:"-" bson:"user_id"`
}
