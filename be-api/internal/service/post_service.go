package service

import (
	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"encoding/base64"
	"encoding/json"
)

type PostService struct {
	repo *repository.PostRepository
}

func NewPostService(repo *repository.PostRepository) *PostService {
	return &PostService{repo: repo}
}

// WallResponse defines the structure for the API response
type WallResponse struct {
	Metadata Metadata     `json:"metadata"`
	Data     []model.Post `json:"data"`
}

type Metadata struct {
	NextCursor string `json:"next_cursor"`
	HasMore    bool   `json:"has_more"`
	Seed       int64  `json:"seed"`
}

// CursorParams struct to decode cursor
type CursorParams struct {
	Offset int `json:"offset"`
}

func (s *PostService) GetWall(filterType string, seed int64, cursorStr string, limit int, currentUserID uint) (*WallResponse, error) {
	// 1. Decode Cursor (Offset based)
	offset := 0
	if cursorStr != "" {
		// decode base64 json
		data, err := base64.StdEncoding.DecodeString(cursorStr)
		if err == nil {
			var cp CursorParams
			_ = json.Unmarshal(data, &cp)
			offset = cp.Offset
		}
	}

	// 2. Fetch Data
	posts, total, err := s.repo.GetPosts(offset, limit, seed, filterType, currentUserID)
	if err != nil {
		return nil, err
	}

	// 3. Prepare Metadata
	nextOffset := offset + len(posts)
	hasMore := int64(nextOffset) < total

	newCursor := ""
	if hasMore {
		cp := CursorParams{Offset: nextOffset}
		data, _ := json.Marshal(cp)
		newCursor = base64.StdEncoding.EncodeToString(data)
	}

	return &WallResponse{
		Metadata: Metadata{
			NextCursor: newCursor,
			HasMore:    hasMore,
			Seed:       seed,
		},
		Data: posts,
	}, nil
}
