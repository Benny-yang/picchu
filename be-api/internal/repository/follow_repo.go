package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// FollowRepository defines the interface for follow-related database operations.
type FollowRepository interface {
	Create(follow *model.Follow) error
	Delete(followerID, followingID uint) error
	IsFollowing(followerID, followingID uint) (bool, error)
	CountFollowers(userID uint) (int64, error)
	CountFollowing(userID uint) (int64, error)
	GetFollowers(userID uint) ([]*model.User, error)
	GetFollowing(userID uint) ([]*model.User, error)
}

type followRepository struct {
	db *gorm.DB
}

// NewFollowRepository creates a new FollowRepository.
func NewFollowRepository(db *gorm.DB) FollowRepository {
	return &followRepository{db: db}
}

func (r *followRepository) Create(follow *model.Follow) error {
	return r.db.Create(follow).Error
}

func (r *followRepository) Delete(followerID, followingID uint) error {
	return r.db.
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Delete(&model.Follow{}).Error
}

func (r *followRepository) IsFollowing(followerID, followingID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.Follow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count).Error
	return count > 0, err
}

func (r *followRepository) CountFollowers(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Follow{}).
		Where("following_id = ?", userID).
		Count(&count).Error
	return count, err
}

func (r *followRepository) CountFollowing(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Follow{}).
		Where("follower_id = ?", userID).
		Count(&count).Error
	return count, err
}

func (r *followRepository) GetFollowers(userID uint) ([]*model.User, error) {
	var users []*model.User
	err := r.db.Table("users").
		Joins("JOIN follows ON follows.follower_id = users.id").
		Where("follows.following_id = ?", userID).
		Preload("Profile").
		Find(&users).Error
	return users, err
}

func (r *followRepository) GetFollowing(userID uint) ([]*model.User, error) {
	var users []*model.User
	err := r.db.Table("users").
		Joins("JOIN follows ON follows.following_id = users.id").
		Where("follows.follower_id = ?", userID).
		Preload("Profile").
		Find(&users).Error
	return users, err
}
