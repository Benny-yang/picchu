package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// NotificationRepository defines the interface for notification-related database operations.
type NotificationRepository interface {
	Create(notification *model.Notification) error
	GetByUserID(userID uint) ([]model.Notification, error)
	MarkAsRead(id uint) error
	GetUnreadCount(userID uint) (int64, error)
}

type notificationRepository struct {
	db *gorm.DB
}

// NewNotificationRepository creates a new NotificationRepository.
func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(notification *model.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) GetByUserID(userID uint) ([]model.Notification, error) {
	var notifications []model.Notification
	err := r.db.Preload("Actor").Preload("Actor.Profile").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(50).
		Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) MarkAsRead(id uint) error {
	return r.db.Model(&model.Notification{}).
		Where("id = ?", id).
		Update("is_read", true).Error
}

func (r *notificationRepository) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error
	return count, err
}
