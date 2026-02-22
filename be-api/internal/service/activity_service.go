package service

import (
	"fmt"
	"time"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/storage"
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
	ratingRepo   repository.RatingRepository
	apiBaseURL   string
}

// NewActivityService creates a new ActivityService.
func NewActivityService(repo repository.ActivityRepository, notifService NotificationService, ratingRepo repository.RatingRepository, apiBaseURL string) ActivityService {
	return &activityService{
		repo:         repo,
		notifService: notifService,
		ratingRepo:   ratingRepo,
		apiBaseURL:   apiBaseURL,
	}
}

func (s *activityService) Create(hostID uint, input CreateActivityInput) (*model.Activity, error) {
	var imageURLs []string
	if len(input.Images) > 0 {
		for i, imgBase64 := range input.Images {
			url, err := storage.SaveBase64Image(s.apiBaseURL, "activities", hostID, imgBase64, i)
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
	activity, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	s.autoEndIfExpired(activity)

	// Populate host's average rating (gorm:"-" field, not loaded by preload)
	if avg, err := s.ratingRepo.GetAverageByUserID(activity.HostID); err == nil {
		activity.Host.AverageRating = avg
	}

	return activity, nil
}

// autoEndIfExpired checks if an activity's event time has passed and
// transitions its status to "ended" if it's still "open" or "full".
func (s *activityService) autoEndIfExpired(activity *model.Activity) {
	if activity == nil {
		return
	}
	if activity.Status != "open" && activity.Status != "full" {
		return
	}
	if activity.EventTime.IsZero() {
		return
	}
	if time.Now().UTC().After(activity.EventTime.UTC()) {
		activity.Status = "ended"
		_ = s.repo.Update(activity)
	}
}

func (s *activityService) Update(userID, activityID uint, input UpdateActivityInput) (*model.Activity, error) {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return nil, apperror.New(apperror.CodeNotFound, "activity not found")
	}
	// Verify host
	if activity.HostID != userID {
		return nil, apperror.New(apperror.CodeForbidden, "only the host can update this activity")
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
			url, err := storage.SaveBase64Image(s.apiBaseURL, "activities", userID, imgStr, i)
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
		return apperror.New(apperror.CodeNotFound, "activity not found")
	}

	if activity.HostID != userID {
		return apperror.New(apperror.CodeForbidden, "only the host can cancel this activity")
	}

	if activity.Status == "cancelled" {
		return apperror.New(apperror.CodeConflict, "activity is already cancelled")
	}

	// Check if within 12 hours of start time
	if time.Now().Add(12 * time.Hour).After(activity.EventTime) {
		return apperror.New(apperror.CodeValidation, "活動開始前 12 小時內無法取消")
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
		return apperror.New(apperror.CodeNotFound, "activity not found")
	}

	if activity.HostID != userID {
		return apperror.New(apperror.CodeForbidden, "only the host can delete this activity")
	}

	return s.repo.Delete(activityID)
}

func (s *activityService) List(filter repository.ActivityFilter) ([]model.Activity, int64, error) {
	activities, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}
	for i := range activities {
		s.autoEndIfExpired(&activities[i])
	}
	return activities, total, nil
}

func (s *activityService) GetByUserID(userID uint) ([]model.Activity, error) {
	activities, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}
	for i := range activities {
		s.autoEndIfExpired(&activities[i])
	}
	return activities, nil
}

// --- Participation ---

func (s *activityService) Apply(activityID, userID uint, message string) error {
	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "activity not found")
	}

	if activity.HostID == userID {
		return apperror.New(apperror.CodeConflict, "host cannot apply to their own activity")
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
		return apperror.New(apperror.CodeConflict, "activity is not open for applications")
	}

	if existing, _ := s.repo.GetParticipant(activityID, userID); existing != nil {
		return apperror.New(apperror.CodeConflict, "already applied to this activity")
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
		return apperror.New(apperror.CodeForbidden, "only the host can invite users")
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
		return "", apperror.New(apperror.CodeNotFound, "activity not found")
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
		return nil, apperror.New(apperror.CodeNotFound, "activity not found")
	}

	if activity.HostID != hostID {
		return nil, apperror.New(apperror.CodeForbidden, "only the host can view applicants")
	}

	applicants, err := s.repo.ListApplicants(activityID)
	if err != nil {
		return nil, err
	}

	for i := range applicants {
		// Populate average rating
		if avg, err := s.ratingRepo.GetAverageByUserID(applicants[i].UserID); err == nil {
			applicants[i].User.AverageRating = avg
		}
	}

	return applicants, nil
}

func (s *activityService) UpdateApplicantStatus(activityID, hostID, applicantUserID uint, status string) error {
	if status != "accepted" && status != "rejected" {
		return apperror.New(apperror.CodeValidation, "status must be 'accepted' or 'rejected'")
	}

	activity, err := s.repo.GetByID(activityID)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "activity not found")
	}

	if activity.HostID != hostID {
		return apperror.New(apperror.CodeForbidden, "only the host can manage applicants")
	}

	participant, err := s.repo.GetParticipant(activityID, applicantUserID)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "applicant not found")
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
	participants, err := s.repo.ListParticipants(activityID)
	if err != nil {
		return nil, err
	}

	for i := range participants {
		// Populate average rating (calculated on the fly)
		if avg, err := s.ratingRepo.GetAverageByUserID(participants[i].UserID); err == nil {
			participants[i].User.AverageRating = avg
		}
	}

	return participants, nil
}

func (s *activityService) GetMyApplications(userID uint) ([]model.ActivityParticipant, error) {
	return s.repo.GetApplicationsByUserID(userID)
}

// parseEventTime parses common time formats from the frontend.
func parseEventTime(timeStr string) (time.Time, error) {
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00", // Explicit ISO8601
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			// Return original time with its location (don't force UTC)
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unsupported time format: %s", timeStr)
}
