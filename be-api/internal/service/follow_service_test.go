package service_test

import (
	"testing"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/service"
)

// --- Mock Repositories ---

// mockFollowRepo is a mock implementation of FollowRepository.
type mockFollowRepo struct {
	follows    map[string]bool // key: "followerID-followingID"
	followers  map[uint]int64
	followings map[uint]int64
}

func newMockFollowRepo() *mockFollowRepo {
	return &mockFollowRepo{
		follows:    make(map[string]bool),
		followers:  make(map[uint]int64),
		followings: make(map[uint]int64),
	}
}

func followKey(f, t uint) string {
	return string(rune(f)) + "-" + string(rune(t))
}

func (r *mockFollowRepo) Create(follow *model.Follow) error {
	key := followKey(follow.FollowerID, follow.FollowingID)
	r.follows[key] = true
	r.followers[follow.FollowingID]++
	r.followings[follow.FollowerID]++
	return nil
}

func (r *mockFollowRepo) Delete(followerID, followingID uint) error {
	key := followKey(followerID, followingID)
	if r.follows[key] {
		delete(r.follows, key)
		r.followers[followingID]--
		r.followings[followerID]--
	}
	return nil
}

func (r *mockFollowRepo) IsFollowing(followerID, followingID uint) (bool, error) {
	return r.follows[followKey(followerID, followingID)], nil
}

func (r *mockFollowRepo) CountFollowers(userID uint) (int64, error) {
	return r.followers[userID], nil
}

func (r *mockFollowRepo) CountFollowing(userID uint) (int64, error) {
	return r.followings[userID], nil
}

func (r *mockFollowRepo) GetFollowers(userID uint) ([]*model.User, error) {
	return []*model.User{}, nil
}

func (r *mockFollowRepo) GetFollowing(userID uint) ([]*model.User, error) {
	return []*model.User{}, nil
}

// mockRatingRepo is a minimal mock for RatingRepository.
type mockRatingRepo struct {
	ratings []model.Rating
}

func newMockRatingRepo() *mockRatingRepo {
	return &mockRatingRepo{}
}

func (r *mockRatingRepo) Create(rating *model.Rating) error {
	r.ratings = append(r.ratings, *rating)
	return nil
}

func (r *mockRatingRepo) GetByActivityAndRater(activityID, raterID uint) ([]model.Rating, error) {
	var result []model.Rating
	for _, rt := range r.ratings {
		if rt.ActivityID == activityID && rt.RaterID == raterID {
			result = append(result, rt)
		}
	}
	return result, nil
}

func (r *mockRatingRepo) GetByActivityID(activityID uint) ([]model.Rating, error) {
	var result []model.Rating
	for _, rt := range r.ratings {
		if rt.ActivityID == activityID {
			result = append(result, rt)
		}
	}
	return result, nil
}

func (r *mockRatingRepo) Exists(activityID, raterID, targetID uint) (bool, error) {
	for _, rt := range r.ratings {
		if rt.ActivityID == activityID && rt.RaterID == raterID && rt.TargetID == targetID {
			return true, nil
		}
	}
	return false, nil
}

func (r *mockRatingRepo) GetAverageByUserID(userID uint) (float64, error) {
	var sum, count float64
	for _, rt := range r.ratings {
		if rt.TargetID == userID {
			sum += float64(rt.Score)
			count++
		}
	}
	if count == 0 {
		return 0, nil
	}
	return sum / count, nil
}

func (r *mockRatingRepo) GetByTargetID(targetID uint) ([]model.Rating, error) {
	var result []model.Rating
	for _, rt := range r.ratings {
		if rt.TargetID == targetID {
			result = append(result, rt)
		}
	}
	return result, nil
}

func (r *mockRatingRepo) GetAveragesByUserIDs(userIDs []uint) (map[uint]float64, error) {
	result := make(map[uint]float64)
	for _, uid := range userIDs {
		avg, _ := r.GetAverageByUserID(uid)
		result[uid] = avg
	}
	return result, nil
}

func (r *mockRatingRepo) GetByActivityAndTarget(activityID, targetID uint) ([]model.Rating, error) {
	var result []model.Rating
	for _, rt := range r.ratings {
		if rt.ActivityID == activityID && rt.TargetID == targetID {
			result = append(result, rt)
		}
	}
	return result, nil
}

// mockFollowNotificationService is a minimal mock for NotificationService.
type mockFollowNotificationService struct {
	notifications []model.Notification
}

func newMockFollowNotificationService() *mockFollowNotificationService {
	return &mockFollowNotificationService{}
}

func (s *mockFollowNotificationService) SendNotification(userID, actorID uint, notifType, referenceID, content string) error {
	s.notifications = append(s.notifications, model.Notification{
		UserID:      userID,
		ActorID:     actorID,
		Type:        notifType,
		ReferenceID: referenceID,
		Content:     content,
	})
	return nil
}

func (s *mockFollowNotificationService) GetByUserID(userID uint) ([]model.Notification, error) {
	return nil, nil
}
func (s *mockFollowNotificationService) MarkAsRead(notificationID uint) error {
	return nil
}
func (s *mockFollowNotificationService) GetUnreadCount(userID uint) (int64, error) {
	return 0, nil
}

// --- Follow Service Tests ---

func TestFollowUser_SelfFollow(t *testing.T) {
	svc := service.NewFollowService(newMockFollowRepo(), newMockRatingRepo(), newMockFollowNotificationService())

	err := svc.FollowUser(1, 1)
	if err == nil {
		t.Fatal("should not allow self-follow")
	}
}

func TestFollowUser_Success(t *testing.T) {
	svc := service.NewFollowService(newMockFollowRepo(), newMockRatingRepo(), newMockFollowNotificationService())

	err := svc.FollowUser(1, 2)
	if err != nil {
		t.Fatalf("FollowUser failed: %v", err)
	}
}

func TestFollowUser_Duplicate(t *testing.T) {
	svc := service.NewFollowService(newMockFollowRepo(), newMockRatingRepo(), newMockFollowNotificationService())

	_ = svc.FollowUser(1, 2)
	err := svc.FollowUser(1, 2)
	if err == nil {
		t.Fatal("should not allow duplicate follow")
	}
}

func TestUnfollowUser_SelfUnfollow(t *testing.T) {
	svc := service.NewFollowService(newMockFollowRepo(), newMockRatingRepo(), newMockFollowNotificationService())

	err := svc.UnfollowUser(1, 1)
	if err == nil {
		t.Fatal("should not allow self-unfollow")
	}
}

func TestGetUserStats(t *testing.T) {
	followRepo := newMockFollowRepo()
	ratingRepo := newMockRatingRepo()
	notifRepo := newMockFollowNotificationService()
	svc := service.NewFollowService(followRepo, ratingRepo, notifRepo)

	_ = svc.FollowUser(2, 1) // user 2 follows user 1
	_ = svc.FollowUser(3, 1) // user 3 follows user 1

	stats, err := svc.GetUserStats(1)
	if err != nil {
		t.Fatalf("GetUserStats failed: %v", err)
	}

	if stats.Fans != 2 {
		t.Errorf("Fans = %d, want 2", stats.Fans)
	}
	if stats.Following != 0 {
		t.Errorf("Following = %d, want 0", stats.Following)
	}
}
