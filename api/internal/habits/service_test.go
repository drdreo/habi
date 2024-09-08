package habits_test

import (
	"api/internal/habits"
	"context"
	"github.com/stretchr/testify/assert"
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

	habit, err := service.CreateHabit(context.Background(), "testUserId", &habitInput)
	assert.NoError(t, err)
	assert.Equal(t, "Test Habit", habit.Name)
	assert.Equal(t, "testUserId", habit.UserId)
}
