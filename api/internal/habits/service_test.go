package habits_test

import (
	"bytes"
	"context"
	"encoding/json"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"io"
	"testing"
	"time"

	"api/internal/habits"
	"github.com/stretchr/testify/assert"
)

func TestCreateHabit(t *testing.T) {
	mockRepo := &habits.MockRepository{
		CreateFunc: func(ctx context.Context, habit habits.HabitInput) (habits.Habit, error) {
			return habits.Habit{
				Id:          primitive.NewObjectID(),
				UserId:      habit.UserId,
				Name:        habit.Name,
				Description: habit.Description,
				Frequency:   habit.Frequency,
				Type:        habit.Type,
				TargetMetric: habits.HabitTargetMetric{
					Type:  habit.TargetMetric.Type,
					Value: habit.TargetMetric.Value,
				},
				CreatedAt: time.Now(),
			}, nil
		},
	}

	service := habits.NewService(mockRepo)

	habitInput := habits.HabitInput{
		Name:        "Test Habit",
		Description: "Test Description",
		Frequency:   "Daily",
		Type:        "Health",
		TargetMetric: habits.HabitTargetMetricInput{
			Type:  "Count",
			Value: "10",
		},
	}

	body, _ := json.Marshal(habitInput)
	r := io.NopCloser(bytes.NewReader(body))

	habit, err := service.CreateHabit(context.Background(), "testUserId", r)
	assert.NoError(t, err)
	assert.Equal(t, "Test Habit", habit.Name)
	assert.Equal(t, "testUserId", habit.UserId)
}
