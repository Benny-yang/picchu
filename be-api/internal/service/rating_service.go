package service

import (
	"errors"
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
)

// RatingService defines the interface for rating-related business logic.
type RatingService interface {
	SubmitRating(activityID, raterID uint, input SubmitRatingInput) error
	GetActivityRatings(activityID, userID uint) (*ActivityRatingsResponse, error)
	GetAverageByUserID(userID uint) (float64, error)
	GetUserReviews(userID uint) ([]model.Rating, error)
}

// SubmitRatingInput represents the rating submission body.
type SubmitRatingInput struct {
	TargetUserID uint   `json:"targetUserId" binding:"required"`
	Rating       int    `json:"rating" binding:"required,min=1,max=5"`
	Comment      string `json:"comment"`
}

// ActivityRatingsResponse groups ratings given and received.
type ActivityRatingsResponse struct {
	Given    []model.Rating `json:"given"`
	Received []model.Rating `json:"received"`
}

type ratingService struct {
	ratingRepo   repository.RatingRepository
	activityRepo repository.ActivityRepository
}

// NewRatingService creates a new RatingService.
func NewRatingService(ratingRepo repository.RatingRepository, activityRepo repository.ActivityRepository) RatingService {
	return &ratingService{ratingRepo: ratingRepo, activityRepo: activityRepo}
}

func (s *ratingService) SubmitRating(activityID, raterID uint, input SubmitRatingInput) error {
	// 1. Activity must be ended
	activity, err := s.activityRepo.GetByID(activityID)
	if err != nil {
		return errors.New("activity not found")
	}
	if activity.Status != "ended" {
		return errors.New("ratings are only available for ended activities")
	}

	// 2. Cannot rate yourself
	if raterID == input.TargetUserID {
		return errors.New("cannot rate yourself")
	}

	// 3. Validate score range
	if input.Rating < 1 || input.Rating > 5 {
		return errors.New("rating must be between 1 and 5")
	}

	// 4. Check for duplicate
	exists, err := s.ratingRepo.Exists(activityID, raterID, input.TargetUserID)
	if err != nil {
		return fmt.Errorf("failed to check existing rating: %w", err)
	}
	if exists {
		return errors.New("you have already rated this user for this activity")
	}

	// 5. Verify both users are participants (or host)
	isRaterParticipant := activity.HostID == raterID
	if !isRaterParticipant {
		p, _ := s.activityRepo.GetParticipant(activityID, raterID)
		isRaterParticipant = p != nil && p.Status == "accepted"
	}
	if !isRaterParticipant {
		return errors.New("only participants can submit ratings")
	}

	isTargetParticipant := activity.HostID == input.TargetUserID
	if !isTargetParticipant {
		p, _ := s.activityRepo.GetParticipant(activityID, input.TargetUserID)
		isTargetParticipant = p != nil && p.Status == "accepted"
	}
	if !isTargetParticipant {
		return errors.New("target user is not a participant of this activity")
	}

	rating := &model.Rating{
		ActivityID: activityID,
		RaterID:    raterID,
		TargetID:   input.TargetUserID,
		Score:      input.Rating,
		Comment:    input.Comment,
	}

	return s.ratingRepo.Create(rating)
}

func (s *ratingService) GetActivityRatings(activityID, userID uint) (*ActivityRatingsResponse, error) {
	given, err := s.ratingRepo.GetByActivityAndRater(activityID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get given ratings: %w", err)
	}

	allRatings, err := s.ratingRepo.GetByActivityID(activityID)
	if err != nil {
		return nil, fmt.Errorf("failed to get activity ratings: %w", err)
	}

	// Filter received ratings
	var received []model.Rating
	for _, r := range allRatings {
		if r.TargetID == userID {
			received = append(received, r)
		}
	}

	return &ActivityRatingsResponse{
		Given:    given,
		Received: received,
	}, nil
}

func (s *ratingService) GetAverageByUserID(userID uint) (float64, error) {
	return s.ratingRepo.GetAverageByUserID(userID)
}

func (s *ratingService) GetUserReviews(userID uint) ([]model.Rating, error) {
	return s.ratingRepo.GetByTargetID(userID)
}
