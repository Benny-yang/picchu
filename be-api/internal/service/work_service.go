package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/storage"
)

// WorkService defines the interface for work/post-related business logic.
type WorkService interface {
	GetWall(filterType string, seed int64, cursorStr string, limit int, currentUserID uint) (*WallResponse, error)
	Create(userID uint, input CreateWorkInput) (*model.Post, error)
	GetByID(id uint, currentUserID uint) (*model.Post, error)
	Update(userID, workID uint, input UpdateWorkInput) (*model.Post, error)
	Delete(userID, workID uint) error
	GetByUserID(userID uint) ([]model.Post, error)
}

// CreateWorkInput represents the data for uploading a new work.
type CreateWorkInput struct {
	Images      []string `json:"images" binding:"required"`
	Description string   `json:"description"`
	Title       string   `json:"title"`
	AspectRatio float64  `json:"aspectRatio"`
}

// UpdateWorkInput represents the data for updating a work.
type UpdateWorkInput struct {
	Description string `json:"description"`
	Title       string `json:"title"`
}

// WallResponse defines the structure for the wall API response.
type WallResponse struct {
	Metadata WallMetadata `json:"metadata"`
	Data     []model.Post `json:"data"`
}

// WallMetadata holds pagination metadata for the wall response.
type WallMetadata struct {
	NextCursor string `json:"next_cursor"`
	HasMore    bool   `json:"has_more"`
	Seed       int64  `json:"seed"`
}

// WallCursorParams struct to decode/encode cursor.
type WallCursorParams struct {
	Offset int `json:"offset"`
}

type workService struct {
	repo       repository.WorkRepository
	apiBaseURL string
	gcsBucket  string
}

// NewWorkService creates a new WorkService.
func NewWorkService(repo repository.WorkRepository, apiBaseURL, gcsBucket string) WorkService {
	return &workService{
		repo:       repo,
		apiBaseURL: apiBaseURL,
		gcsBucket:  gcsBucket,
	}
}

func (s *workService) GetWall(filterType string, seed int64, cursorStr string, limit int, currentUserID uint) (*WallResponse, error) {
	offset := 0
	if cursorStr != "" {
		data, err := base64.StdEncoding.DecodeString(cursorStr)
		if err == nil {
			var cp WallCursorParams
			_ = json.Unmarshal(data, &cp)
			offset = cp.Offset
		}
	}

	posts, total, err := s.repo.GetPosts(offset, limit, seed, filterType, currentUserID)
	if err != nil {
		return nil, err
	}

	nextOffset := offset + len(posts)
	hasMore := int64(nextOffset) < total

	newCursor := ""
	if hasMore {
		cp := WallCursorParams{Offset: nextOffset}
		data, _ := json.Marshal(cp)
		newCursor = base64.StdEncoding.EncodeToString(data)
	}

	return &WallResponse{
		Metadata: WallMetadata{
			NextCursor: newCursor,
			HasMore:    hasMore,
			Seed:       seed,
		},
		Data: posts,
	}, nil
}

func (s *workService) Create(userID uint, input CreateWorkInput) (*model.Post, error) {
	aspectRatio := input.AspectRatio
	if aspectRatio <= 0 {
		aspectRatio = 1.0
	}

	if len(input.Images) == 0 {
		return nil, apperror.New(apperror.CodeValidation, "at least one image is required")
	}

	var imageURLs []string
	for i, imgBase64 := range input.Images {
		url, err := storage.SaveBase64Image(s.apiBaseURL, s.gcsBucket, "works", userID, imgBase64, i)
		if err != nil {
			return nil, err
		}
		imageURLs = append(imageURLs, url)
	}

	post := &model.Post{
		UserID:      userID,
		ImageURL:    imageURLs[0], // First image is cover
		Images:      imageURLs,    // Store all images
		Description: input.Description,
		Title:       input.Title,
		AspectRatio: aspectRatio,
	}

	// Process hashtags
	tags, err := s.processTags(input.Description)
	if err == nil {
		post.Tags = tags
	}

	if err := s.repo.Create(post); err != nil {
		return nil, fmt.Errorf("failed to create work: %w", err)
	}

	return post, nil
}

func (s *workService) GetByID(id uint, currentUserID uint) (*model.Post, error) {
	return s.repo.GetByID(id, currentUserID)
}

func (s *workService) Update(userID, workID uint, input UpdateWorkInput) (*model.Post, error) {
	post, err := s.repo.GetByID(workID, userID)
	if err != nil {
		return nil, apperror.New(apperror.CodeNotFound, "work not found")
	}

	if post.UserID != userID {
		return nil, apperror.New(apperror.CodeForbidden, "only the author can update this work")
	}

	if input.Description != "" {
		post.Description = input.Description
	}
	if input.Title != "" {
		post.Title = input.Title
	}

	// Process hashtags if description updated
	if input.Description != "" {
		tags, err := s.processTags(input.Description)
		if err == nil {
			post.Tags = tags
		}
	}

	if err := s.repo.Update(post); err != nil {
		return nil, fmt.Errorf("failed to update work: %w", err)
	}

	return post, nil
}

func (s *workService) Delete(userID, workID uint) error {
	post, err := s.repo.GetByID(workID, userID)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "work not found")
	}

	if post.UserID != userID {
		return apperror.New(apperror.CodeForbidden, "only the author can delete this work")
	}

	return s.repo.Delete(workID)
}

func (s *workService) GetByUserID(userID uint) ([]model.Post, error) {
	return s.repo.GetByUserID(userID)
}

func (s *workService) processTags(description string) ([]model.Tag, error) {
	// Extract hashtags
	re := regexp.MustCompile(`#(\p{L}+)`) // Support Unicode letters
	matches := re.FindAllStringSubmatch(description, -1)
	if len(matches) == 0 {
		return nil, nil
	}

	// Deduplicate names
	uniqueNames := make(map[string]bool)
	var names []string
	for _, match := range matches {
		if len(match) > 1 {
			name := strings.ToLower(match[1]) // Normalize to lowercase
			if !uniqueNames[name] {
				uniqueNames[name] = true
				names = append(names, name)
			}
		}
	}

	if len(names) == 0 {
		return nil, nil
	}

	// Find existing tags
	existingTags, err := s.repo.GetTagsByNames(names)
	if err != nil {
		return nil, err
	}

	existingMap := make(map[string]uint)
	for _, t := range existingTags {
		existingMap[t.Name] = t.ID
	}

	var finalTags []model.Tag
	for _, name := range names {
		if id, ok := existingMap[name]; ok {
			finalTags = append(finalTags, model.Tag{ID: id, Name: name})
		} else {
			finalTags = append(finalTags, model.Tag{Name: name})
		}
	}

	return finalTags, nil
}
