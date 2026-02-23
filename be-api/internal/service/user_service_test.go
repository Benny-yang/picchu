package service_test

import (
	"errors"
	"testing"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/service"
)

// --- Mock User Repository ---

type mockUserRepo struct {
	users    map[uint]*model.User
	profiles map[uint]*model.UserProfile
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{
		users:    make(map[uint]*model.User),
		profiles: make(map[uint]*model.UserProfile),
	}
}

func (r *mockUserRepo) Create(user *model.User) error {
	user.ID = uint(len(r.users) + 1)
	r.users[user.ID] = user
	return nil
}

func (r *mockUserRepo) GetByID(id uint) (*model.User, error) {
	u, ok := r.users[id]
	if !ok {
		return nil, errors.New("user not found")
	}
	return u, nil
}

func (r *mockUserRepo) GetByUsername(username string) (*model.User, error) {
	for _, u := range r.users {
		if u.UserName == username {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (r *mockUserRepo) GetByEmail(email string) (*model.User, error) {
	for _, u := range r.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (r *mockUserRepo) GetByVerificationToken(token string) (*model.User, error) {
	return nil, errors.New("not found")
}

func (r *mockUserRepo) GetByResetToken(token string) (*model.User, error) {
	return nil, errors.New("not found")
}

func (r *mockUserRepo) GetAll() ([]model.User, error) {
	var result []model.User
	for _, u := range r.users {
		result = append(result, *u)
	}
	return result, nil
}

func (r *mockUserRepo) GetProfileByUserID(userID uint) (*model.UserProfile, error) {
	p, ok := r.profiles[userID]
	if !ok {
		return nil, errors.New("profile not found")
	}
	return p, nil
}

func (r *mockUserRepo) UpdateProfile(profile *model.UserProfile) error {
	r.profiles[profile.UserID] = profile
	return nil
}

func (r *mockUserRepo) UpdateUser(user *model.User) error {
	r.users[user.ID] = user
	return nil
}

// --- User Service Tests ---

func TestGetUserWithProfile_IncludesAverageRating(t *testing.T) {
	userRepo := newMockUserRepo()
	followRepo := newMockFollowRepo()
	ratingRepo := newMockRatingRepo()

	// Seed a user
	user := &model.User{UserName: "testuser", Email: "test@example.com", Password: "hashed"}
	_ = userRepo.Create(user)

	// Seed ratings targeting this user (simulating two ratings: scores 4 and 5 → avg = 4.5)
	_ = ratingRepo.Create(&model.Rating{ActivityID: 1, RaterID: 2, TargetID: user.ID, Score: 4})
	_ = ratingRepo.Create(&model.Rating{ActivityID: 2, RaterID: 3, TargetID: user.ID, Score: 5})

	svc := service.NewUserService(userRepo, followRepo, ratingRepo, "http://localhost:8080", "http://localhost:5173", "")

	result, err := svc.GetUserWithProfile(user.ID)
	if err != nil {
		t.Fatalf("GetUserWithProfile failed: %v", err)
	}

	expectedAvg := 4.5
	if result.AverageRating != expectedAvg {
		t.Errorf("AverageRating = %v, want %v", result.AverageRating, expectedAvg)
	}
}

func TestGetUserWithProfile_NoRatingsReturnsZero(t *testing.T) {
	userRepo := newMockUserRepo()
	followRepo := newMockFollowRepo()
	ratingRepo := newMockRatingRepo()

	user := &model.User{UserName: "newuser", Email: "new@example.com", Password: "hashed"}
	_ = userRepo.Create(user)

	svc := service.NewUserService(userRepo, followRepo, ratingRepo, "http://localhost:8080", "http://localhost:5173", "")

	result, err := svc.GetUserWithProfile(user.ID)
	if err != nil {
		t.Fatalf("GetUserWithProfile failed: %v", err)
	}

	if result.AverageRating != 0 {
		t.Errorf("AverageRating = %v, want 0", result.AverageRating)
	}
}

func TestGetUserWithProfile_ReturnsFollowCounts(t *testing.T) {
	userRepo := newMockUserRepo()
	followRepo := newMockFollowRepo()
	ratingRepo := newMockRatingRepo()

	user := &model.User{UserName: "popular", Email: "popular@example.com", Password: "hashed"}
	_ = userRepo.Create(user)

	// Simulate 2 followers
	_ = followRepo.Create(&model.Follow{FollowerID: 10, FollowingID: user.ID})
	_ = followRepo.Create(&model.Follow{FollowerID: 11, FollowingID: user.ID})

	svc := service.NewUserService(userRepo, followRepo, ratingRepo, "http://localhost:8080", "http://localhost:5173", "")

	result, err := svc.GetUserWithProfile(user.ID)
	if err != nil {
		t.Fatalf("GetUserWithProfile failed: %v", err)
	}

	if result.FollowerCount != 2 {
		t.Errorf("FollowerCount = %d, want 2", result.FollowerCount)
	}
	if result.FollowingCount != 0 {
		t.Errorf("FollowingCount = %d, want 0", result.FollowingCount)
	}
}
