package service

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
)

// ActivityService defines the interface for activity-related business logic.
type ActivityService interface {
	Create(hostID uint, input CreateActivityInput) (*model.Activity, error)
	GetByID(id uint) (*model.Activity, error)
	Update(userID, activityID uint, input UpdateActivityInput) (*model.Activity, error)
	Cancel(userID, activityID uint, reason string) error
	Delete(userID, activityID uint) error
	List(filter repository.ActivityFilter) ([]model.Activity, int64, error)
	GetByUserID(userID uint) ([]model.Activity, error)

	// Participation
	Apply(activityID, userID uint, message string) error
	CancelApplication(activityID, userID uint) error
	GetUserStatus(activityID, userID uint) (string, error)
	InviteUser(activityID, hostID, targetID uint, message string) error

	// Host Management
	ListApplicants(activityID, hostID uint) ([]model.ActivityParticipant, error)
	UpdateApplicantStatus(activityID, hostID, applicantUserID uint, status string) error
	RejectApplicant(activityID, hostID, applicantID uint) error

	// Participants (for rating)
	ListParticipants(activityID uint) ([]model.ActivityParticipant, error)
	// User applications
	GetMyApplications(userID uint) ([]model.ActivityParticipant, error)
}

// CreateActivityInput represents the data for creating an activity.
type CreateActivityInput struct {
	Title           string   `json:"title" binding:"required"`
	Description     string   `json:"description"`
	Location        string   `json:"location"`
	EventTime       string   `json:"eventTime"`
	MaxParticipants int      `json:"maxParticipants"`
	Images          []string `json:"images"`
	Tags            string   `json:"tags"`
	Roles           []string `json:"roles"`
}

// UpdateActivityInput represents the data for updating an activity.
type UpdateActivityInput struct {
	Title           string   `json:"title"`
	Description     string   `json:"description"`
	Location        string   `json:"location"`
	EventTime       string   `json:"eventTime"`
	MaxParticipants *int     `json:"maxParticipants"`
	Status          string   `json:"status"`
	Images          []string `json:"images"`
	Tags            string   `json:"tags"`
	Roles           []string `json:"roles"`
}

// ApplyInput represents the data for applying to an activity.
type ApplyInput struct {
	Message string `json:"message"`
}

// InviteInput represents the data for inviting a user.
type InviteInput struct {
	UserID  uint   `json:"userId" binding:"required"`
	Message string `json:"message"`
}

// UpdateApplicantStatusInput represents the status update body.
type UpdateApplicantStatusInput struct {
	Status string `json:"status" binding:"required"`
}

type activityService struct {
	repo         repository.ActivityRepository
	notifService NotificationService
}

// NewActivityService creates a new ActivityService.
func NewActivityService(repo repository.ActivityRepository, notifService NotificationService) ActivityService {
	return &activityService{repo: repo, notifService: notifService}
}

func (s *activityService) Create(hostID uint, input CreateActivityInput) (*model.Activity, error) {
	var imageURLs []string
	if len(input.Images) > 0 {
		for i, imgBase64 := range input.Images {
			url, err := saveActivityImageFromBase64(hostID, imgBase64, i)
			if err != nil {
				return nil, fmt.Errorf("failed to save image: %w", err)
			}
			imageURLs = append(imageURLs, url)
		}
	}

	var eventTime time.Time
	if input.EventTime != "" {
		parsedTime, err := parseEventTime(input.EventTime)
		if err != nil {
			return nil, fmt.Errorf("invalid event time format: %w", err)
		}
		eventTime = parsedTime
	}

	activity := &model.Activity{
		HostID:          hostID,
		Title:           input.Title,
		Description:     input.Description,
		Location:        input.Location,
		EventTime:       eventTime,
		MaxParticipants: input.MaxParticipants,
		Status:          "open",
		Images:          imageURLs,
		Tags:            input.Tags,
		Roles:           input.Roles,
	}

	if err := s.repo.Create(activity); err != nil {
		return nil, fmt.Errorf("failed to create activity: %w", err)
	}

	return activity, nil
}

func (s *activityService) GetByID(id uint) (*model.Activity, error) {
	return s.repo.GetByID(id)
}

func (s *activityService) Update(userID, activityID uint, input UpdateActivityInput) (*model.Activity, error) {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return nil, errors.New("activity not found")
	}
	// Verify host
	if activity.HostID != userID {
		return nil, errors.New("only the host can update this activity")
	}

	if input.Title != "" {
		activity.Title = input.Title
	}
	if input.Description != "" {
		activity.Description = input.Description
	}
	if input.Location != "" {
		activity.Location = input.Location
	}
	if input.EventTime != "" {
		t, err := parseEventTime(input.EventTime)
		if err != nil {
			return nil, fmt.Errorf("invalid event time format: %w", err)
		}
		activity.EventTime = t
	}
	if input.MaxParticipants != nil {
		activity.MaxParticipants = *input.MaxParticipants
		if activity.Status != "open" && activity.Status != "cancelled" && activity.Status != "ended" && activity.MaxParticipants > int(activity.CurrentParticipants) {
			activity.Status = "open"
		}
	}
	if input.Status != "" {
		activity.Status = input.Status
	}
	if len(input.Images) > 0 {
		var imageURLs []string
		for i, imgStr := range input.Images {
			// Check if it's an existing URL
			if len(imgStr) > 4 && imgStr[:4] == "http" {
				imageURLs = append(imageURLs, imgStr)
				continue
			}

			// Otherwise treat as new base64 image
			url, err := saveActivityImageFromBase64(userID, imgStr, i)
			if err != nil {
				return nil, fmt.Errorf("failed to save image: %w", err)
			}
			imageURLs = append(imageURLs, url)
		}
		activity.Images = imageURLs
	}
	if input.Tags != "" {
		activity.Tags = input.Tags
	}
	if len(input.Roles) > 0 {
		activity.Roles = input.Roles
	}

	if err := s.repo.Update(activity); err != nil {
		return nil, fmt.Errorf("failed to update activity: %w", err)
	}

	return activity, nil
}

func (s *activityService) Cancel(userID, activityID uint, reason string) error {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return errors.New("activity not found")
	}

	if activity.HostID != userID {
		return errors.New("only the host can cancel this activity")
	}

	if activity.Status == "cancelled" {
		return errors.New("activity is already cancelled")
	}

	// Check if within 12 hours of start time
	if time.Now().Add(12 * time.Hour).After(activity.EventTime) {
		return errors.New("活動開始前 12 小時內無法取消")
	}

	// Update status
	activity.Status = "cancelled"
	if err := s.repo.Update(activity); err != nil {
		return fmt.Errorf("failed to cancel activity: %w", err)
	}

	// Notify participants
	participants, err := s.repo.ListParticipants(activityID)
	if err == nil {
		for _, p := range participants {
			msg := fmt.Sprintf("活動已取消：%s", activity.Title)
			if reason != "" {
				msg = fmt.Sprintf("%s - 原因：%s", msg, reason)
			}
			_ = s.notifService.SendNotification(p.UserID, userID, "activity_cancelled", fmt.Sprintf("%d", activityID), msg)
		}
	}

	return nil
}

func (s *activityService) Delete(userID, activityID uint) error {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return errors.New("activity not found")
	}

	if activity.HostID != userID {
		return errors.New("only the host can delete this activity")
	}

	return s.repo.Delete(activityID)
}

func (s *activityService) List(filter repository.ActivityFilter) ([]model.Activity, int64, error) {
	return s.repo.List(filter)
}

func (s *activityService) GetByUserID(userID uint) ([]model.Activity, error) {
	return s.repo.GetByUserID(userID)
}

// --- Participation ---

func (s *activityService) Apply(activityID, userID uint, message string) error {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return errors.New("activity not found")
	}

	if activity.HostID == userID {
		return errors.New("host cannot apply to their own activity")
	}

	// Sync status with reality (Self-healing)
	if activity.Status != "cancelled" && activity.Status != "ended" {
		currentCount := int(activity.CurrentParticipants)
		if activity.MaxParticipants > currentCount && activity.Status == "full" {
			activity.Status = "open"
			_ = s.repo.Update(activity)
		} else if activity.MaxParticipants <= currentCount && activity.Status == "open" {
			activity.Status = "full"
			_ = s.repo.Update(activity)
		}
	}

	if activity.Status != "open" {
		return errors.New("activity is not open for applications")
	}

	if existing, _ := s.repo.GetParticipant(activityID, userID); existing != nil {
		return errors.New("already applied to this activity")
	}

	participant := &model.ActivityParticipant{
		ActivityID: activityID,
		UserID:     userID,
		Status:     "pending",
		Message:    message,
	}

	if err := s.repo.CreateParticipant(participant); err != nil {
		return err
	}

	// Send notification to host
	_ = s.notifService.SendNotification(activity.HostID, userID, "join_request", fmt.Sprintf("%d", activityID), activity.Title)

	return nil
}

func (s *activityService) InviteUser(activityID, hostID, targetID uint, message string) error {
	// 1. Check if activity exists
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return err
	}

	// 2. Check if hostID is the owner
	if activity.HostID != hostID {
		return errors.New("only the host can invite users")
	}

	// 3. Send Notification
	// Type: "invitation", ReferenceID: activityID, Content: custom message or default
	notifContent := fmt.Sprintf("邀請你參加活動：%s", activity.Title)
	if message != "" {
		notifContent = fmt.Sprintf("%s - 邀請訊息：%s", notifContent, message)
	}

	return s.notifService.SendNotification(targetID, hostID, "invitation", fmt.Sprintf("%d", activityID), notifContent)
}

func (s *activityService) CancelApplication(activityID, userID uint) error {
	return s.repo.DeleteParticipant(activityID, userID)
}

func (s *activityService) RejectApplicant(activityID, hostID, applicantID uint) error {
	return s.UpdateApplicantStatus(activityID, hostID, applicantID, "rejected")
}

func (s *activityService) GetUserStatus(activityID, userID uint) (string, error) {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return "", errors.New("activity not found")
	}

	if activity.HostID == userID {
		return "host", nil
	}

	participant, err := s.repo.GetParticipant(activityID, userID)
	if err != nil {
		return "idle", nil
	}

	return participant.Status, nil
}

// --- Host Management ---

func (s *activityService) ListApplicants(activityID, hostID uint) ([]model.ActivityParticipant, error) {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return nil, errors.New("activity not found")
	}

	if activity.HostID != hostID {
		return nil, errors.New("only the host can view applicants")
	}

	return s.repo.ListApplicants(activityID)
}

func (s *activityService) UpdateApplicantStatus(activityID, hostID, applicantUserID uint, status string) error {
	if status != "accepted" && status != "rejected" {
		return errors.New("status must be 'accepted' or 'rejected'")
	}

	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return errors.New("activity not found")
	}

	if activity.HostID != hostID {
		return errors.New("only the host can manage applicants")
	}

	participant, err := s.repo.GetParticipant(activityID, applicantUserID)
	if err != nil {
		return errors.New("applicant not found")
	}

	if err := s.repo.UpdateParticipantStatus(participant.ID, status); err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}

	// Auto-update activity status to "full" if accepted count reaches max
	if status == "accepted" && activity.MaxParticipants > 0 {
		accepted, err := s.repo.CountAccepted(activityID)
		if err == nil && int(accepted) >= activity.MaxParticipants {
			activity.Status = "full"
			_ = s.repo.Update(activity)
		}
	}

	// Send notification to applicant
	_ = s.notifService.SendNotification(applicantUserID, hostID, status, fmt.Sprintf("%d", activityID), activity.Title)

	return nil
}

func (s *activityService) ListParticipants(activityID uint) ([]model.ActivityParticipant, error) {
	return s.repo.ListParticipants(activityID)
}

func (s *activityService) GetMyApplications(userID uint) ([]model.ActivityParticipant, error) {
	return s.repo.GetApplicationsByUserID(userID)
}

// parseEventTime parses common time formats from the frontend.
func parseEventTime(timeStr string) (time.Time, error) {
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unsupported time format: %s", timeStr)
}

// Helper to save activity images
func saveActivityImageFromBase64(userID uint, base64Data string, index int) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	// Generate unique filename
	fileName := fmt.Sprintf("activity_%d_%d_%d.jpg", userID, time.Now().Unix(), index)
	filePath := filepath.Join("uploads", "activities", fileName)

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return "", fmt.Errorf("failed to create activity directory: %w", err)
	}

	// Decode base64
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", errors.New("invalid base64 image data")
	}

	// Write file
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to save activity image: %w", err)
	}

	// Return full URL
	// NOTE: Hardcoded localhost for dev, same as WorkService
	return fmt.Sprintf("http://localhost:8080/uploads/activities/%s", fileName), nil
}
