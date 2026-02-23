package service_test

import (
	"errors"
	"testing"
	"time"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/internal/service"
)

type mockCommentRepo struct{}

func (m *mockCommentRepo) Create(comment *model.Comment) error {
	comment.ID = 1
	return nil
}

func (m *mockCommentRepo) GetByWorkID(workID uint) ([]model.Comment, error) {
	return nil, nil
}

func (m *mockCommentRepo) GetByActivityID(activityID uint) ([]model.Comment, error) {
	return nil, nil
}

func (m *mockCommentRepo) Update(comment *model.Comment) error {
	return nil
}

func (m *mockCommentRepo) Delete(id uint) error {
	return nil
}

func (m *mockCommentRepo) GetByID(id uint) (*model.Comment, error) {
	return &model.Comment{ID: id}, nil
}

func newMockCommentRepo() *mockCommentRepo {
	return &mockCommentRepo{}
}

// ==============
// Mock RatingRepository
// ==============---

// --- Mock Activity Repository ---

type mockActivityRepo struct {
	activities   map[uint]*model.Activity
	participants map[string]*model.ActivityParticipant // key: "activityID-userID"
	nextID       uint
	nextPID      uint
}

func newMockActivityRepo() *mockActivityRepo {
	return &mockActivityRepo{
		activities:   make(map[uint]*model.Activity),
		participants: make(map[string]*model.ActivityParticipant),
		nextID:       1,
		nextPID:      1,
	}
}

func participantKey(activityID, userID uint) string {
	return string(rune(activityID)) + "-" + string(rune(userID))
}

func (r *mockActivityRepo) Create(activity *model.Activity) error {
	activity.ID = r.nextID
	r.nextID++
	r.activities[activity.ID] = activity
	return nil
}

func (r *mockActivityRepo) GetByID(id uint) (*model.Activity, error) {
	a, ok := r.activities[id]
	if !ok {
		return nil, errors.New("not found")
	}
	return a, nil
}

func (r *mockActivityRepo) Update(activity *model.Activity) error {
	r.activities[activity.ID] = activity
	return nil
}

func (r *mockActivityRepo) Delete(id uint) error {
	delete(r.activities, id)
	return nil
}

func (r *mockActivityRepo) List(_ repository.ActivityFilter) ([]model.Activity, int64, error) {
	var result []model.Activity
	for _, a := range r.activities {
		result = append(result, *a)
	}
	return result, int64(len(result)), nil
}

func (r *mockActivityRepo) GetByUserID(_ uint) ([]model.Activity, error) {
	return nil, nil
}

func (r *mockActivityRepo) CreateParticipant(p *model.ActivityParticipant) error {
	p.ID = r.nextPID
	r.nextPID++
	key := participantKey(p.ActivityID, p.UserID)
	r.participants[key] = p
	return nil
}

func (r *mockActivityRepo) DeleteParticipant(activityID, userID uint) error {
	delete(r.participants, participantKey(activityID, userID))
	return nil
}

func (r *mockActivityRepo) GetParticipant(activityID, userID uint) (*model.ActivityParticipant, error) {
	p, ok := r.participants[participantKey(activityID, userID)]
	if !ok {
		return nil, errors.New("not found")
	}
	return p, nil
}

func (r *mockActivityRepo) ListParticipants(activityID uint) ([]model.ActivityParticipant, error) {
	var result []model.ActivityParticipant
	for _, p := range r.participants {
		if p.ActivityID == activityID && p.Status == "accepted" {
			result = append(result, *p)
		}
	}
	return result, nil
}

func (r *mockActivityRepo) ListApplicants(activityID uint) ([]model.ActivityParticipant, error) {
	var result []model.ActivityParticipant
	for _, p := range r.participants {
		if p.ActivityID == activityID {
			result = append(result, *p)
		}
	}
	return result, nil
}

func (r *mockActivityRepo) UpdateParticipantStatus(id uint, status string) error {
	for _, p := range r.participants {
		if p.ID == id {
			p.Status = status
			return nil
		}
	}
	return errors.New("not found")
}

func (r *mockActivityRepo) CountAccepted(activityID uint) (int64, error) {
	var count int64
	for _, p := range r.participants {
		if p.ActivityID == activityID && p.Status == "accepted" {
			count++
		}
	}
	return count, nil
}

func (r *mockActivityRepo) BatchCountAccepted(activityIDs []uint) (map[uint]int64, error) {
	result := make(map[uint]int64)
	for _, id := range activityIDs {
		count, _ := r.CountAccepted(id)
		result[id] = count
	}
	return result, nil
}

func (r *mockActivityRepo) GetApplicationsByUserID(userID uint) ([]model.ActivityParticipant, error) {
	var result []model.ActivityParticipant
	for _, p := range r.participants {
		if p.UserID == userID {
			result = append(result, *p)
		}
	}
	return result, nil
}

// --- Mock Notification Service ---

type mockNotificationService struct{}

func newMockNotificationService() *mockNotificationService {
	return &mockNotificationService{}
}

func (m *mockNotificationService) SendNotification(userID, actorID uint, notifType, referenceID, content string) error {
	return nil
}

func (m *mockNotificationService) GetByUserID(userID uint) ([]model.Notification, error) {
	return nil, nil
}

func (m *mockNotificationService) MarkAsRead(notificationID uint) error {
	return nil
}

func (m *mockNotificationService) GetUnreadCount(userID uint) (int64, error) {
	return 0, nil
}

// --- Activity Service Tests ---

func TestCreateActivity(t *testing.T) {
	repo := newMockActivityRepo()
	notif := newMockNotificationService()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", notif)

	input := service.CreateActivityInput{
		Title:       "Test Activity",
		Description: "A test activity",
		Location:    "Taipei",
	}

	activity, err := svc.Create(1, input)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}
	if activity.Title != "Test Activity" {
		t.Errorf("Title = %s, want Test Activity", activity.Title)
	}
	if activity.HostID != 1 {
		t.Errorf("HostID = %d, want 1", activity.HostID)
	}
	if activity.Status != "open" {
		t.Errorf("Status = %s, want open", activity.Status)
	}
}

func TestUpdateActivity_OnlyHost(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity"}
	activity, _ := svc.Create(1, input)

	// Non-host tries to update
	_, err := svc.Update(2, activity.ID, service.UpdateActivityInput{Title: "Hacked"})
	if err == nil {
		t.Fatal("non-host should not be able to update")
	}

	// Host updates
	updated, err := svc.Update(1, activity.ID, service.UpdateActivityInput{Title: "Updated"})
	if err != nil {
		t.Fatalf("host update failed: %v", err)
	}
	if updated.Title != "Updated" {
		t.Errorf("Title = %s, want Updated", updated.Title)
	}
}

func TestDeleteActivity_OnlyHost(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity"}
	activity, _ := svc.Create(1, input)

	err := svc.Delete(2, activity.ID)
	if err == nil {
		t.Fatal("non-host should not be able to delete")
	}

	err = svc.Delete(1, activity.ID)
	if err != nil {
		t.Fatalf("host delete failed: %v", err)
	}
}

func TestApply_HostCannotApply(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity"}
	activity, _ := svc.Create(1, input)

	err := svc.Apply(activity.ID, 1, "I want to join")
	if err == nil {
		t.Fatal("host should not be able to apply to own activity")
	}
}

func TestApply_Success(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)

	err := svc.Apply(activity.ID, 2, "I want to join")
	if err != nil {
		t.Fatalf("Apply failed: %v", err)
	}
}

func TestApply_Duplicate(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)

	_ = svc.Apply(activity.ID, 2, "first")
	err := svc.Apply(activity.ID, 2, "second")
	if err == nil {
		t.Fatal("duplicate application should fail")
	}
}

func TestApply_NotOpenActivity(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)
	activity.Status = "ended"
	_ = repo.Update(activity)

	err := svc.Apply(activity.ID, 2, "join")
	if err == nil {
		t.Fatal("should not allow application to non-open activity")
	}
}

func TestGetUserStatus(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)

	// Host status
	status, _ := svc.GetUserStatus(activity.ID, 1)
	if status != "host" {
		t.Errorf("Status = %s, want host", status)
	}

	// Non-participant
	status, _ = svc.GetUserStatus(activity.ID, 2)
	if status != "idle" {
		t.Errorf("Status = %s, want idle", status)
	}

	// Applied
	_ = svc.Apply(activity.ID, 2, "join")
	status, _ = svc.GetUserStatus(activity.ID, 2)
	if status != "pending" {
		t.Errorf("Status = %s, want pending", status)
	}
}

func TestUpdateApplicantStatus_OnlyHost(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)
	_ = svc.Apply(activity.ID, 2, "join")

	// Non-host
	err := svc.UpdateApplicantStatus(activity.ID, 3, 2, "accepted")
	if err == nil {
		t.Fatal("non-host should not be able to manage applicants")
	}

	// Host accepts
	err = svc.UpdateApplicantStatus(activity.ID, 1, 2, "accepted")
	if err != nil {
		t.Fatalf("host accept failed: %v", err)
	}
}

func TestUpdateApplicantStatus_InvalidStatus(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activity, _ := svc.Create(1, input)
	_ = svc.Apply(activity.ID, 2, "join")

	err := svc.UpdateApplicantStatus(activity.ID, 1, 2, "invalid_status")
	if err == nil {
		t.Fatal("invalid status should be rejected")
	}
}

func TestCreateActivity_EventTimeWithTimezoneOffset(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{
		Title:     "Timezone Test",
		EventTime: "2026-02-17T21:00:00+08:00",
	}

	activity, err := svc.Create(1, input)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	// 2026-02-17T21:00:00+08:00 should be stored as 2026-02-17T13:00:00 UTC
	expectedYear := 2026
	expectedMonth := 2
	expectedDay := 17
	expectedHour := 13
	expectedMinute := 0

	if activity.EventTime.Year() != expectedYear ||
		int(activity.EventTime.Month()) != expectedMonth ||
		activity.EventTime.Day() != expectedDay ||
		activity.EventTime.Hour() != expectedHour ||
		activity.EventTime.Minute() != expectedMinute {
		t.Errorf("EventTime = %v, want 2026-02-17 13:00:00 UTC", activity.EventTime)
	}

	if activity.EventTime.Location().String() != "UTC" {
		t.Errorf("EventTime location = %s, want UTC", activity.EventTime.Location().String())
	}

	// Verify via GetByID
	fetched, err := svc.GetByID(activity.ID)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}
	if !fetched.EventTime.Equal(activity.EventTime) {
		t.Errorf("GetByID EventTime = %v, want %v", fetched.EventTime, activity.EventTime)
	}
}

func TestCreateActivity_EventTimeWithoutOffset(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	input := service.CreateActivityInput{
		Title:     "No Offset Test",
		EventTime: "2026-02-17T21:00:00",
	}

	activity, err := svc.Create(1, input)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	// Without offset, time.Parse treats it as UTC, so it stays 21:00 UTC
	if activity.EventTime.Hour() != 21 {
		t.Errorf("EventTime hour = %d, want 21", activity.EventTime.Hour())
	}
	if activity.EventTime.Location().String() != "UTC" {
		t.Errorf("EventTime location = %s, want UTC", activity.EventTime.Location().String())
	}
}

func TestGetByID_AutoEndExpiredActivity(t *testing.T) {
	repo := newMockActivityRepo()
	svc := service.NewActivityService(repo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())

	// Create an activity with an event time in the past (1 hour ago)
	input := service.CreateActivityInput{
		Title:     "Past Activity",
		EventTime: time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339),
	}

	created, err := svc.Create(1, input)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	if created.Status != "open" {
		t.Fatalf("initial status = %q, want 'open'", created.Status)
	}

	// BE-H2 CQS fix: GetByID is a pure read — it no longer triggers auto-end.
	// The status remains 'open' as persisted in the DB until List runs.
	fetched, err := svc.GetByID(created.ID)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}
	if fetched.Status != "open" {
		t.Errorf("GetByID should not auto-end; status = %q, want 'open'", fetched.Status)
	}

	// List triggers lazy auto-end (CQS-compliant write path)
	activities, _, err := svc.List(repository.ActivityFilter{})
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(activities) == 0 {
		t.Fatal("expected at least one activity from List")
	}
	if activities[0].Status != "ended" {
		t.Errorf("status after List = %q, want 'ended'", activities[0].Status)
	}
}
