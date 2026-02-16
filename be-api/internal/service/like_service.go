package service

import (
	"errors"
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
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
		return errors.New("already liked this work")
	}

	like := &model.Like{
		UserID: userID,
		WorkID: workID,
	}

	if err := s.likeRepo.Create(like); err != nil {
		return fmt.Errorf("failed to like work: %w", err)
	}

	if err := s.workRepo.IncrementLikeCount(workID); err != nil {
		fmt.Printf("warning: failed to increment like count for work %d: %v\n", workID, err)
	}

	return nil
}

func (s *likeService) UnlikeWork(userID, workID uint) error {
	isLiked, err := s.likeRepo.IsLiked(userID, workID)
	if err != nil {
		return err
	}
	if !isLiked {
		return errors.New("not liked this work")
	}

	if err := s.likeRepo.Delete(userID, workID); err != nil {
		return fmt.Errorf("failed to unlike work: %w", err)
	}

	if err := s.workRepo.DecrementLikeCount(workID); err != nil {
		fmt.Printf("warning: failed to decrement like count for work %d: %v\n", workID, err)
	}

	return nil
}
