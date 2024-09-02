package habits

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
)

type Service interface {
	GetAllHabits(ctx context.Context, userId string) ([]Habit, error)
	GetHabitById(ctx context.Context, userId string, habitId string) (Habit, error)
	CreateHabit(ctx context.Context, userId string, body io.ReadCloser) (Habit, error)
	CompleteHabitById(ctx context.Context, userId string, habitId string) (HabitCompletion, error)
	ArchiveHabitById(ctx context.Context, userId string, habitId string) (Habit, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetAllHabits(ctx context.Context, userId string) ([]Habit, error) {
	slog.Debug("Get all habits")

	habit, err := s.repo.GetAll(ctx, userId)
	if err != nil {
		return nil, err
	}

	return habit, nil
}

func (s *service) GetHabitById(ctx context.Context, userId string, habitId string) (Habit, error) {
	slog.Debug("Get habit by id")

	habit, err := s.repo.GetById(ctx, userId, habitId)
	if err != nil {
		return Habit{}, err
	}

	return habit, nil
}

func (s *service) CreateHabit(ctx context.Context, userId string, body io.ReadCloser) (Habit, error) {
	slog.Debug("Creating habit")
	var habitInput HabitInput

	defer func(body io.ReadCloser) {
		err := body.Close()
		if err != nil {
			slog.Warn("Failed to close body", "err", err)
		}
	}(body)

	err := json.NewDecoder(body).Decode(&habitInput)
	if err != nil {
		return Habit{}, errors.New("failed to parse habit data")
	}

	err = validateHabit(habitInput)
	if err != nil {
		return Habit{}, err
	}

	habit, err := s.repo.Create(ctx, userId, habitInput)
	if err != nil {
		return Habit{}, err
	}

	return habit, nil
}

func (s *service) CompleteHabitById(ctx context.Context, userId string, habitId string) (HabitCompletion, error) {
	slog.Debug("Complete habit by id")

	habitCompletion, err := s.repo.CompleteById(ctx, userId, habitId)
	if err != nil {
		return HabitCompletion{}, err
	}

	return habitCompletion, nil
}

func (s *service) ArchiveHabitById(ctx context.Context, userId string, habitId string) (Habit, error) {
	slog.Debug("Archive habit by id")

	habit, err := s.repo.ArchiveById(ctx, userId, habitId)
	if err != nil {
		return Habit{}, err
	}

	return habit, nil
}

func validateHabit(h HabitInput) error {
	if h.Name == "" {
		return errors.New("habit name cannot be empty")
	}

	return nil
}
