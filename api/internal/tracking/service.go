package tracking

import (
	"context"
	"log/slog"
)

type Service interface {
	Create(ctx context.Context, userId string, habitId string) (*Tracking, error)
	UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error
	Get(ctx context.Context, userId string, habitId string) (*Tracking, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Get(ctx context.Context, userId string, habitId string) (*Tracking, error) {
	slog.Debug("Get tracking sessions")

	trackingSession, err := s.repo.Get(ctx, userId, habitId)
	if err != nil {
		return nil, err
	}

	return trackingSession, nil
}


func (s *service) Create(ctx context.Context, userId string, habitId string) (*Tracking, error) {
	slog.Debug("Create tracking session")

	trackingSession, err := s.repo.Create(ctx, userId, habitId)
	if err != nil {
		return nil, err
	}

	return trackingSession, nil
}

func (s *service) UpdateLocation(ctx context.Context, userId string, habitId string, locationUpdate LocationUpdate) error {
	slog.Debug("Update tracking location")

	err := s.repo.UpdateLocation(ctx, userId, habitId, locationUpdate)
	return err
}
