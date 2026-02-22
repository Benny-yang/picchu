package service

import (
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/logger"
)

// LikeService defines the interface for like-related business logic.
type LikeService interface {
	LikeWork(userID, workID uint) error
	UnlikeWork(userID, workID uint) error
}

type likeService struct {
	likeRepo repository.LikeRepository
	workRepo repository.WorkRepository
}

// NewLikeService creates a new LikeService.
func NewLikeService(likeRepo repository.LikeRepository, workRepo repository.WorkRepository) LikeService {
	return &likeService{likeRepo: likeRepo, workRepo: workRepo}
}

func (s *likeService) LikeWork(userID, workID uint) error {
	isLiked, err := s.likeRepo.IsLiked(userID, workID)
	if err != nil {
		return err
	}
	if isLiked {
		return apperror.New(apperror.CodeConflict, "already liked this work")
	}

	like := &model.Like{
		UserID: userID,
		WorkID: workID,
	}

	if err := s.likeRepo.Create(like); err != nil {
		return fmt.Errorf("failed to like work: %w", err)
	}

	if err := s.workRepo.IncrementLikeCount(workID); err != nil {
		logger.Warn("failed to increment like count", "workID", workID, "error", err)
	}

	return nil
}

func (s *likeService) UnlikeWork(userID, workID uint) error {
	isLiked, err := s.likeRepo.IsLiked(userID, workID)
	if err != nil {
		return err
	}
	if !isLiked {
		return apperror.New(apperror.CodeConflict, "not liked this work")
	}

	if err := s.likeRepo.Delete(userID, workID); err != nil {
		return fmt.Errorf("failed to unlike work: %w", err)
	}

	if err := s.workRepo.DecrementLikeCount(workID); err != nil {
		logger.Warn("failed to decrement like count", "workID", workID, "error", err)
	}

	return nil
}
