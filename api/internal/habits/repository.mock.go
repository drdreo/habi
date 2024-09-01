package habits

import (
	"context"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type RepositoryMock struct {
}

func CreateHabitRepositoryMock() *RepositoryMock {
	return &RepositoryMock{}
}

var habitMock = Habit{
	Id:          primitive.NewObjectID(),
	UserId:      "testUserId",
	Name:        "Test Habit",
	Description: "Test Description",
	Frequency:   "Daily",
	Type:        "Health",
	TargetMetric: HabitTargetMetric{
		Type:  "Count",
		Value: "10",
	},
	CreatedAt: time.Now(),
}

func (m *RepositoryMock) Create(ctx context.Context, habit HabitInput) (Habit, error) {
	return Habit{
		Id:          primitive.NewObjectID(),
		UserId:      habit.UserId,
		Name:        habit.Name,
		Description: habit.Description,
		Frequency:   habit.Frequency,
		Type:        habit.Type,
		TargetMetric: HabitTargetMetric{
			Type:  habit.TargetMetric.Type,
			Value: habit.TargetMetric.Value,
		},
		CreatedAt: time.Now(),
	}, nil
}

func (m *RepositoryMock) GetAll(ctx context.Context, userId string) ([]Habit, error) {
	var habits []Habit
	return habits, nil
}

func (m *RepositoryMock) GetById(ctx context.Context, userId string, habitId string) (Habit, error) {
	return habitMock, nil
}
