package habits

import (
	"context"
	"errors"
)

type MockRepository struct {
	CreateFunc func(ctx context.Context, habit HabitInput) (Habit, error)
}

func (m *MockRepository) Create(ctx context.Context, habit HabitInput) (Habit, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, habit)
	}
	return Habit{}, errors.New("not implemented")
}
