package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// RatingRepository defines the interface for rating-related database operations.
type RatingRepository interface {
	Create(rating *model.Rating) error
	GetByActivityAndRater(activityID, raterID uint) ([]model.Rating, error)
	GetByActivityID(activityID uint) ([]model.Rating, error)
	Exists(activityID, raterID, targetID uint) (bool, error)
	GetAverageByUserID(userID uint) (float64, error)
	GetByTargetID(targetID uint) ([]model.Rating, error)
}

type ratingRepository struct {
	db *gorm.DB
}

// NewRatingRepository creates a new RatingRepository.
func NewRatingRepository(db *gorm.DB) RatingRepository {
	return &ratingRepository{db: db}
}

func (r *ratingRepository) Create(rating *model.Rating) error {
	return r.db.Create(rating).Error
}

func (r *ratingRepository) GetByActivityAndRater(activityID, raterID uint) ([]model.Rating, error) {
	var ratings []model.Rating
	err := r.db.Preload("Target").
		Where("activity_id = ? AND rater_id = ?", activityID, raterID).
		Find(&ratings).Error
	return ratings, err
}

func (r *ratingRepository) GetByActivityID(activityID uint) ([]model.Rating, error) {
	var ratings []model.Rating
	err := r.db.Preload("Rater").Preload("Target").
		Where("activity_id = ?", activityID).
		Find(&ratings).Error
	return ratings, err
}

func (r *ratingRepository) Exists(activityID, raterID, targetID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.Rating{}).
		Where("activity_id = ? AND rater_id = ? AND target_id = ?", activityID, raterID, targetID).
		Count(&count).Error
	return count > 0, err
}

func (r *ratingRepository) GetAverageByUserID(userID uint) (float64, error) {
	var avg float64
	err := r.db.Model(&model.Rating{}).
		Where("target_id = ?", userID).
		Select("COALESCE(AVG(score), 0)").
		Scan(&avg).Error
	return avg, err
}

func (r *ratingRepository) GetByTargetID(targetID uint) ([]model.Rating, error) {
	var ratings []model.Rating
	err := r.db.Preload("Rater").Preload("Activity").
		Where("target_id = ?", targetID).
		Order("created_at desc").
		Find(&ratings).Error
	return ratings, err
}
