package service_test

import (
	"testing"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/service"
)

// --- Mock Work Repository ---

type mockWorkRepo struct {
	works  map[uint]*model.Post
	nextID uint
}

func newMockWorkRepo() *mockWorkRepo {
	return &mockWorkRepo{
		works:  make(map[uint]*model.Post),
		nextID: 1,
	}
}

func (r *mockWorkRepo) Create(post *model.Post) error {
	post.ID = r.nextID
	r.nextID++
	r.works[post.ID] = post
	return nil
}

func (r *mockWorkRepo) GetByID(id uint, _ uint) (*model.Post, error) {
	p, ok := r.works[id]
	if !ok {
		return nil, errNotFound
	}
	return p, nil
}

func (r *mockWorkRepo) Update(post *model.Post) error {
	r.works[post.ID] = post
	return nil
}

func (r *mockWorkRepo) Delete(id uint) error {
	delete(r.works, id)
	return nil
}

func (r *mockWorkRepo) GetByUserID(_ uint) ([]model.Post, error) {
	return nil, nil
}

func (r *mockWorkRepo) GetPosts(_, _ int, _ int64, _ string, _ uint) ([]model.Post, int64, error) {
	return nil, 0, nil
}

func (r *mockWorkRepo) IncrementLikeCount(_ uint) error    { return nil }
func (r *mockWorkRepo) DecrementLikeCount(_ uint) error    { return nil }
func (r *mockWorkRepo) IncrementCommentCount(_ uint) error { return nil }
func (r *mockWorkRepo) DecrementCommentCount(_ uint) error { return nil }

func (r *mockWorkRepo) GetTagsByNames(_ []string) ([]model.Tag, error) {
	return nil, nil
}

// --- Mock Like Repository ---

type mockLikeRepo struct {
	likes map[string]bool // key: "userID-workID"
}

func newMockLikeRepo() *mockLikeRepo {
	return &mockLikeRepo{likes: make(map[string]bool)}
}

func likeKey(userID, workID uint) string {
	return string(rune(userID)) + "-" + string(rune(workID))
}

func (r *mockLikeRepo) Create(like *model.Like) error {
	r.likes[likeKey(like.UserID, like.WorkID)] = true
	return nil
}

func (r *mockLikeRepo) Delete(userID, workID uint) error {
	delete(r.likes, likeKey(userID, workID))
	return nil
}

func (r *mockLikeRepo) IsLiked(userID, workID uint) (bool, error) {
	return r.likes[likeKey(userID, workID)], nil
}

// --- Work Service Tests ---

func TestCreateWork(t *testing.T) {
	repo := newMockWorkRepo()
	svc := service.NewWorkService(repo, "http://localhost:8080")

	input := service.CreateWorkInput{
		Images:      []string{"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"},
		Description: "My work",
		Title:       "Test Work",
		AspectRatio: 1.5,
	}

	work, err := svc.Create(1, input)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}
	if work.UserID != 1 {
		t.Errorf("UserID = %d, want 1", work.UserID)
	}
	if work.Title != "Test Work" {
		t.Errorf("Title = %s, want Test Work", work.Title)
	}
}

func TestUpdateWork_OnlyAuthor(t *testing.T) {
	repo := newMockWorkRepo()
	svc := service.NewWorkService(repo, "http://localhost:8080")

	input := service.CreateWorkInput{Images: []string{"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}}
	work, _ := svc.Create(1, input)

	// Non-author
	_, err := svc.Update(2, work.ID, service.UpdateWorkInput{Description: "hacked"})
	if err == nil {
		t.Fatal("non-author should not be able to update")
	}

	// Author
	updated, err := svc.Update(1, work.ID, service.UpdateWorkInput{Description: "legit"})
	if err != nil {
		t.Fatalf("author update failed: %v", err)
	}
	if updated.Description != "legit" {
		t.Errorf("Description = %s, want legit", updated.Description)
	}
}

func TestDeleteWork_OnlyAuthor(t *testing.T) {
	repo := newMockWorkRepo()
	svc := service.NewWorkService(repo, "http://localhost:8080")

	input := service.CreateWorkInput{Images: []string{"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}}
	work, _ := svc.Create(1, input)

	err := svc.Delete(2, work.ID)
	if err == nil {
		t.Fatal("non-author should not be able to delete")
	}

	err = svc.Delete(1, work.ID)
	if err != nil {
		t.Fatalf("author delete failed: %v", err)
	}
}

// --- Like Service Tests ---

func TestLikeWork_Success(t *testing.T) {
	svc := service.NewLikeService(newMockLikeRepo(), newMockWorkRepo(), nil)

	err := svc.LikeWork(1, 1)
	if err != nil {
		t.Fatalf("LikeWork failed: %v", err)
	}
}

func TestLikeWork_Duplicate(t *testing.T) {
	svc := service.NewLikeService(newMockLikeRepo(), newMockWorkRepo(), nil)

	_ = svc.LikeWork(1, 1)
	err := svc.LikeWork(1, 1)
	if err == nil {
		t.Fatal("duplicate like should fail")
	}
}

func TestUnlikeWork_NotLiked(t *testing.T) {
	svc := service.NewLikeService(newMockLikeRepo(), newMockWorkRepo(), nil)

	err := svc.UnlikeWork(1, 1)
	if err == nil {
		t.Fatal("unlike without prior like should fail")
	}
}

func TestLikeAndUnlike(t *testing.T) {
	svc := service.NewLikeService(newMockLikeRepo(), newMockWorkRepo(), nil)

	_ = svc.LikeWork(1, 1)
	err := svc.UnlikeWork(1, 1)
	if err != nil {
		t.Fatalf("UnlikeWork failed: %v", err)
	}

	// Should be able to like again
	err = svc.LikeWork(1, 1)
	if err != nil {
		t.Fatalf("re-LikeWork failed: %v", err)
	}
}
