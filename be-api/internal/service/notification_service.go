package service

import (
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
)

// NotificationService defines the interface for notification-related business logic.
type NotificationService interface {
	SendNotification(userID, actorID uint, notifType, referenceID, content string) error
	GetByUserID(userID uint) ([]model.Notification, error)
	MarkAsRead(notificationID uint) error
	GetUnreadCount(userID uint) (int64, error)
}

type notificationService struct {
	repo repository.NotificationRepository
}

// NewNotificationService creates a new NotificationService.
func NewNotificationService(repo repository.NotificationRepository) NotificationService {
	return &notificationService{repo: repo}
}

func (s *notificationService) SendNotification(userID, actorID uint, notifType, referenceID, content string) error {
	// Don't send notification to yourself
	if userID == actorID {
		return nil
	}

	notification := &model.Notification{
		UserID:      userID,
		ActorID:     actorID,
		Type:        notifType,
		ReferenceID: referenceID,
		Content:     content,
		IsRead:      false,
	}

	if err := s.repo.Create(notification); err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	return nil
}

func (s *notificationService) GetByUserID(userID uint) ([]model.Notification, error) {
	return s.repo.GetByUserID(userID)
}

func (s *notificationService) MarkAsRead(notificationID uint) error {
	return s.repo.MarkAsRead(notificationID)
}

func (s *notificationService) GetUnreadCount(userID uint) (int64, error) {
	return s.repo.GetUnreadCount(userID)
}
