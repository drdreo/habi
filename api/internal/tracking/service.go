package tracking

import (
	"context"
	"log/slog"
)

type Service interface {
	Create(ctx context.Context, userId string, habitId string) (*Tracking, error)
	UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, userId string, habitId string) (*Tracking, error) {
	slog.Debug("Get all habits")

	trackingSession, err := s.repo.Create(ctx, userId, habitId)
	if err != nil {
		return nil, err
	}

	return trackingSession, nil
}

func (s *service) UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error {
	slog.Debug("Get habit by id")

	err := s.repo.UpdateLocation(ctx, userId, habitId, locationUpdate)
	return err
}
