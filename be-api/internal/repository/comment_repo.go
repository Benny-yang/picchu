package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// CommentRepository defines the interface for comment-related database operations.
type CommentRepository interface {
	Create(comment *model.Comment) error
	GetByID(id uint) (*model.Comment, error)
	Delete(id uint) error
	GetByActivityID(activityID uint) ([]model.Comment, error)
	GetByWorkID(workID uint) ([]model.Comment, error)
}

type commentRepository struct {
	db *gorm.DB
}

// NewCommentRepository creates a new CommentRepository.
func NewCommentRepository(db *gorm.DB) CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

func (r *commentRepository) GetByID(id uint) (*model.Comment, error) {
	var comment model.Comment
	if err := r.db.Preload("User").Preload("User.Profile").First(&comment, id).Error; err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *commentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Comment{}, id).Error
}

func (r *commentRepository) GetByActivityID(activityID uint) ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Preload("User").Preload("User.Profile").
		Where("activity_id = ?", activityID).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}

func (r *commentRepository) GetByWorkID(workID uint) ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Preload("User").Preload("User.Profile").
		Where("work_id = ?", workID).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}
