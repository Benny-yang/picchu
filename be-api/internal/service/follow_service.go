package service

import (
	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"fmt"
)

// FollowService defines the interface for follow-related business logic.
type FollowService interface {
	FollowUser(followerID, targetID uint) error
	UnfollowUser(followerID, targetID uint) error
	IsFollowing(followerID, targetID uint) (bool, error)
	GetUserStats(userID uint) (*UserStats, error)
	GetFollowers(userID uint) ([]*model.User, error)
	GetFollowing(userID uint) ([]*model.User, error)
}

// UserStats holds aggregated statistics for a user's social profile.
type UserStats struct {
	Fans      int64   `json:"fans"`
	Following int64   `json:"following"`
	Rating    float64 `json:"rating"`
}

type followService struct {
	followRepo   repository.FollowRepository
	ratingRepo   repository.RatingRepository
	notifService NotificationService
}

// NewFollowService creates a new FollowService.
func NewFollowService(followRepo repository.FollowRepository, ratingRepo repository.RatingRepository, notifService NotificationService) FollowService {
	return &followService{followRepo: followRepo, ratingRepo: ratingRepo, notifService: notifService}
}

func (s *followService) FollowUser(followerID, targetID uint) error {
	if followerID == targetID {
		return apperror.New(apperror.CodeValidation, "cannot follow yourself")
	}

	isFollowing, err := s.followRepo.IsFollowing(followerID, targetID)
	if err != nil {
		return err
	}
	if isFollowing {
		return apperror.New(apperror.CodeConflict, "already following this user")
	}

	follow := &model.Follow{
		FollowerID:  followerID,
		FollowingID: targetID,
	}
	if err := s.followRepo.Create(follow); err != nil {
		return err
	}

	// Send notification
	// Type: "follow", ReferenceID: followerID (as string), Content: "started following you"
	// We might fetch follower name for better content, or just let frontend handle it based on ActorID
	_ = s.notifService.SendNotification(targetID, followerID, "follow", fmt.Sprintf("%d", followerID), "開始追蹤你")

	return nil
}

func (s *followService) UnfollowUser(followerID, targetID uint) error {
	if followerID == targetID {
		return apperror.New(apperror.CodeValidation, "cannot unfollow yourself")
	}

	return s.followRepo.Delete(followerID, targetID)
}

func (s *followService) IsFollowing(followerID, targetID uint) (bool, error) {
	return s.followRepo.IsFollowing(followerID, targetID)
}

func (s *followService) GetUserStats(userID uint) (*UserStats, error) {
	fans, err := s.followRepo.CountFollowers(userID)
	if err != nil {
		return nil, err
	}

	following, err := s.followRepo.CountFollowing(userID)
	if err != nil {
		return nil, err
	}

	avgRating, err := s.ratingRepo.GetAverageByUserID(userID)
	if err != nil {
		avgRating = 0
	}

	return &UserStats{
		Fans:      fans,
		Following: following,
		Rating:    avgRating,
	}, nil
}

func (s *followService) GetFollowers(userID uint) ([]*model.User, error) {
	return s.followRepo.GetFollowers(userID)
}

func (s *followService) GetFollowing(userID uint) ([]*model.User, error) {
	return s.followRepo.GetFollowing(userID)
}
