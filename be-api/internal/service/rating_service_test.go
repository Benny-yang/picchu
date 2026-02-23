package service_test

import (
	"errors"
	"testing"

	"azure-magnetar/internal/service"
)

var errNotFound = errors.New("not found")

// --- Rating Service Tests ---
// Uses mockActivityRepo and mockRatingRepo from other test files in this package.

func setupRatingTest() (service.RatingService, *mockActivityRepo, *mockRatingRepo) {
	activityRepo := newMockActivityRepo()
	ratingRepo := newMockRatingRepo()
	svc := service.NewRatingService(ratingRepo, activityRepo)
	return svc, activityRepo, ratingRepo
}

func TestSubmitRating_ActivityNotEnded(t *testing.T) {
	svc, activityRepo, _ := setupRatingTest()

	// Create an open activity
	input := service.CreateActivityInput{Title: "Open Activity"}
	activitySvc := service.NewActivityService(activityRepo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())
	activity, _ := activitySvc.Create(1, input)

	err := svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       5,
		Comment:      "great",
	})
	if err == nil {
		t.Fatal("should not allow rating on non-ended activity")
	}
}

func TestSubmitRating_SelfRating(t *testing.T) {
	svc, activityRepo, _ := setupRatingTest()

	input := service.CreateActivityInput{Title: "Ended Activity"}
	activitySvc := service.NewActivityService(activityRepo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())
	activity, _ := activitySvc.Create(1, input)
	activity.Status = "ended"
	_ = activityRepo.Update(activity)

	err := svc.SubmitRating(activity.ID, 1, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       5,
	})
	if err == nil {
		t.Fatal("should not allow self-rating")
	}
}

func TestSubmitRating_InvalidScore(t *testing.T) {
	svc, activityRepo, _ := setupRatingTest()

	input := service.CreateActivityInput{Title: "Ended Activity"}
	activitySvc := service.NewActivityService(activityRepo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())
	activity, _ := activitySvc.Create(1, input)
	activity.Status = "ended"
	_ = activityRepo.Update(activity)

	err := svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       6, // invalid
	})
	if err == nil {
		t.Fatal("should reject rating > 5")
	}

	err = svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       0, // invalid
	})
	if err == nil {
		t.Fatal("should reject rating < 1")
	}
}

func TestSubmitRating_Success(t *testing.T) {
	svc, activityRepo, _ := setupRatingTest()

	// Create activity while open, apply user 2, accept, then end the activity
	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activitySvc := service.NewActivityService(activityRepo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())
	activity, _ := activitySvc.Create(1, input)

	// Apply while activity is still open
	if err := activitySvc.Apply(activity.ID, 2, "join"); err != nil {
		t.Fatalf("Apply failed: %v", err)
	}
	if err := activitySvc.UpdateApplicantStatus(activity.ID, 1, 2, "accepted"); err != nil {
		t.Fatalf("Accept failed: %v", err)
	}

	// Now end the activity
	activity.Status = "ended"
	_ = activityRepo.Update(activity)

	// User 2 (accepted participant) rates user 1 (host)
	err := svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       4,
		Comment:      "good host",
	})
	if err != nil {
		t.Fatalf("SubmitRating failed: %v", err)
	}
}

func TestSubmitRating_Duplicate(t *testing.T) {
	svc, activityRepo, _ := setupRatingTest()

	input := service.CreateActivityInput{Title: "Test Activity", MaxParticipants: 10}
	activitySvc := service.NewActivityService(activityRepo, newMockCommentRepo(), newMockRatingRepo(), "http://localhost:8080", "", newMockNotificationService())
	activity, _ := activitySvc.Create(1, input)

	// Apply while activity is still open
	_ = activitySvc.Apply(activity.ID, 2, "join")
	_ = activitySvc.UpdateApplicantStatus(activity.ID, 1, 2, "accepted")

	// End the activity
	activity.Status = "ended"
	_ = activityRepo.Update(activity)

	_ = svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       4,
	})

	err := svc.SubmitRating(activity.ID, 2, service.SubmitRatingInput{
		TargetUserID: 1,
		Rating:       5,
	})
	if err == nil {
		t.Fatal("duplicate rating should fail")
	}
}
