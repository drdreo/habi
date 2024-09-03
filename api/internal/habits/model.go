package habits

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type HabitTargetMetricInput struct {
	Type string
	Goal int
	Unit string
}

type HabitInput struct {
	Name         string
	Description  string
	Frequency    string
	Type         string
	TargetMetric HabitTargetMetricInput
}

type HabitTargetMetric struct {
	Type        string `json:"metric" bson:"metric"`
	Goal        int    `json:"goal" bson:"goal"`
	Unit        string `json:"unit" bson:"unit"`
	Completions int    `json:"completions" bson:"completions"` // completions are gathered dynamically
}

type Habit struct {
	Name         string            `json:"name" bson:"name"`
	Description  string            `json:"description" bson:"description"`
	Frequency    string            `json:"frequency" bson:"frequency"`
	Type         string            `json:"type" bson:"type"`
	TargetMetric HabitTargetMetric `json:"targetMetric" bson:"target_metric"`
	Archived     *bool             `json:"archived" bson:"archived"` // optional
	UserId       string            `json:"-" bson:"user_id"`
	// Mongo related stuff
	Id        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

type HabitCompletion struct {
	HabitId primitive.ObjectID `json:"habitId" bson:"habit_id"`
	UserId  string             `json:"-" bson:"user_id"`
	Goal    int                `json:"goal" bson:"goal"`
	// Mongo related stuff
	Id        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

type HabitDetails struct {
	Habit
}
