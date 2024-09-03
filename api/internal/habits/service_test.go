package habits_test

import (
	"api/internal/habits"
	"bytes"
	"context"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"io"
	"testing"
)

func TestCreateHabit(t *testing.T) {
	mockRepo := habits.CreateHabitRepositoryMock()

	service := habits.NewService(mockRepo)

	habitInput := habits.HabitInput{
		Name:        "Test Habit",
		Description: "Test Description",
		Frequency:   "Daily",
		Type:        "Health",
		TargetMetric: habits.HabitTargetMetricInput{
			Type: "Count",
			Goal: 10,
		},
	}

	body, _ := json.Marshal(habitInput)
	r := io.NopCloser(bytes.NewReader(body))

	habit, err := service.CreateHabit(context.Background(), "testUserId", r)
	assert.NoError(t, err)
	assert.Equal(t, "Test Habit", habit.Name)
	assert.Equal(t, "testUserId", habit.UserId)
}
