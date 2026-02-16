package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// LikeRepository defines the interface for like-related database operations.
type LikeRepository interface {
	Create(like *model.Like) error
	Delete(userID, workID uint) error
	IsLiked(userID, workID uint) (bool, error)
}

type likeRepository struct {
	db *gorm.DB
}

// NewLikeRepository creates a new LikeRepository.
func NewLikeRepository(db *gorm.DB) LikeRepository {
	return &likeRepository{db: db}
}

func (r *likeRepository) Create(like *model.Like) error {
	return r.db.Create(like).Error
}

func (r *likeRepository) Delete(userID, workID uint) error {
	return r.db.
		Where("user_id = ? AND work_id = ?", userID, workID).
		Delete(&model.Like{}).Error
}

func (r *likeRepository) IsLiked(userID, workID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.Like{}).
		Where("user_id = ? AND work_id = ?", userID, workID).
		Count(&count).Error
	return count > 0, err
}
