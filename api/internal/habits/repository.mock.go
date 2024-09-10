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
	Frequency:   "daily",
	Type:        "good",
	TargetMetric: HabitTargetMetric{
		Type: "quantity",
		Goal: 10,
	},
	Completions: []HabitCompletion{
		{CreatedAt: time.Now()},
	},
	CreatedAt: time.Now(),
}

func (m *RepositoryMock) Create(ctx context.Context, userId string, habit *HabitCreateInput) (Habit, error) {
	return Habit{
		Id:          primitive.NewObjectID(),
		UserId:      userId,
		Name:        habit.Name,
		Description: habit.Description,
		Frequency:   habit.Frequency,
		Type:        habit.Type,
		TargetMetric: HabitTargetMetric{
			Type: habit.TargetMetric.Type,
			Goal: habit.TargetMetric.Goal,
		},
		Completions: []HabitCompletion{},
		CreatedAt:   time.Now(),
	}, nil
}

func (m *RepositoryMock) GetAll(ctx context.Context, userId string) ([]Habit, error) {
	var habits []Habit
	return habits, nil
}

func (m *RepositoryMock) GetById(ctx context.Context, userId string, habitId string) (Habit, error) {
	return habitMock, nil
}

func (m *RepositoryMock) UpdateById(ctx context.Context, userId string, habitId string, habitUpdate *HabitUpdateInput) (Habit, error) {
	return habitMock, nil
}

func (m *RepositoryMock) DeleteById(ctx context.Context, userId string, habitId string) error {
	return nil
}

func (m *RepositoryMock) CompleteById(ctx context.Context, userId string, habitId string) (*Habit, error) {
	return &habitMock, nil
}

func (m *RepositoryMock) ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error) {
	return habitMock, nil
}
