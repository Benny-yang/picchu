package handler

import (
	"net/http"

	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// NotificationHandler handles notification-related HTTP requests.
type NotificationHandler struct {
	notificationService service.NotificationService
}

// NewNotificationHandler creates a new NotificationHandler.
func NewNotificationHandler(notificationService service.NotificationService) *NotificationHandler {
	return &NotificationHandler{notificationService: notificationService}
}

// ListNotifications godoc
// @Summary      List notifications
// @Description  Get the current user's notifications
// @Tags         notifications
// @Security     BearerAuth
// @Success      200  {object}  response.Response
// @Router       /notifications [get]
func (h *NotificationHandler) ListNotifications(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	notifications, err := h.notificationService.GetByUserID(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, notifications)
}

// MarkAsRead godoc
// @Summary      Mark notification as read
// @Tags         notifications
// @Security     BearerAuth
// @Param        id path int true "Notification ID"
// @Success      200  {object}  response.Response
// @Router       /notifications/{id}/read [post]
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	notificationID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid notification ID")
		return
	}

	if err := h.notificationService.MarkAsRead(notificationID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, "marked as read")
}

// GetUnreadCount godoc
// @Summary      Get unread notification count
// @Description  Lightweight check for unread count (for polling)
// @Tags         notifications
// @Security     BearerAuth
// @Success      200  {object}  response.Response
// @Router       /notifications/unread-count [get]
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	count, err := h.notificationService.GetUnreadCount(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{"count": count})
}
