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

var habitCompletionMock = HabitCompletion{
	HabitId: habitMock.Id.Hex(),
	UserId:  "testUserId",
}

func (m *RepositoryMock) Create(ctx context.Context, userId string, habit HabitInput) (Habit, error) {
	return Habit{
		Id:          primitive.NewObjectID(),
		UserId:      userId,
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

func (m *RepositoryMock) CompleteById(ctx context.Context, userId string, habitId string) (HabitCompletion, error) {
	return habitCompletionMock, nil
}

func (m *RepositoryMock) ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error) {
	return habitMock, nil
}