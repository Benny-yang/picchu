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
	// GetByActivityAndTarget returns ratings for a specific target within an activity (DB-level filter).
	GetByActivityAndTarget(activityID, targetID uint) ([]model.Rating, error)
	Exists(activityID, raterID, targetID uint) (bool, error)
	GetAverageByUserID(userID uint) (float64, error)
	GetAveragesByUserIDs(userIDs []uint) (map[uint]float64, error)
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
	err := r.db.Preload("Rater").Preload("Rater.Profile").Preload("Activity").
		Where("target_id = ?", targetID).
		Order("created_at desc").
		Find(&ratings).Error
	return ratings, err
}

// GetByActivityAndTarget returns ratings where target_id matches within an activity.
// BE-M3 fix: avoids in-memory filtering by using a DB WHERE clause.
func (r *ratingRepository) GetByActivityAndTarget(activityID, targetID uint) ([]model.Rating, error) {
	var ratings []model.Rating
	err := r.db.Preload("Rater").Preload("Rater.Profile").
		Where("activity_id = ? AND target_id = ?", activityID, targetID).
		Find(&ratings).Error
	return ratings, err
}

// GetAveragesByUserIDs batch-fetches average ratings for multiple users in a
// single query, eliminating N+1 when populating comment author ratings.
func (r *ratingRepository) GetAveragesByUserIDs(userIDs []uint) (map[uint]float64, error) {
	result := make(map[uint]float64)
	if len(userIDs) == 0 {
		return result, nil
	}

	type avgRow struct {
		TargetID uint
		Average  float64
	}

	var rows []avgRow
	err := r.db.Model(&model.Rating{}).
		Select("target_id, COALESCE(AVG(score), 0) as average").
		Where("target_id IN ?", userIDs).
		Group("target_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		result[row.TargetID] = row.Average
	}
	return result, nil
}
