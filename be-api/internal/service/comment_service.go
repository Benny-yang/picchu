package service

import (
	"errors"
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/logger"
)

// CommentService defines the interface for comment-related business logic.
type CommentService interface {
	CreateForActivity(activityID, userID uint, content string) (*model.Comment, error)
	CreateForWork(workID, userID uint, content string) (*model.Comment, error)
	GetByActivityID(activityID uint) ([]model.Comment, error)
	GetByWorkID(workID uint) ([]model.Comment, error)
	Delete(commentID, userID uint) error
}

// CreateCommentInput represents the request body for creating a comment.
type CreateCommentInput struct {
	Content string `json:"content" binding:"required"`
}

type commentService struct {
	commentRepo repository.CommentRepository
	workRepo    repository.WorkRepository
	ratingRepo  repository.RatingRepository
}

// NewCommentService creates a new CommentService.
func NewCommentService(commentRepo repository.CommentRepository, workRepo repository.WorkRepository, ratingRepo repository.RatingRepository) CommentService {
	return &commentService{
		commentRepo: commentRepo,
		workRepo:    workRepo,
		ratingRepo:  ratingRepo,
	}
}

func (s *commentService) CreateForActivity(activityID, userID uint, content string) (*model.Comment, error) {
	if content == "" {
		return nil, apperror.New(apperror.CodeValidation, "comment content is required")
	}

	comment := &model.Comment{
		ActivityID: &activityID,
		UserID:     userID,
		Content:    content,
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return s.commentRepo.GetByID(comment.ID)
}

func (s *commentService) CreateForWork(workID, userID uint, content string) (*model.Comment, error) {
	if content == "" {
		return nil, errors.New("comment content is required")
	}

	comment := &model.Comment{
		WorkID:  &workID,
		UserID:  userID,
		Content: content,
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	// Update denormalized comment count
	if err := s.workRepo.IncrementCommentCount(workID); err != nil {
		logger.Warn("failed to increment comment count", "workID", workID, "error", err)
	}

	return s.commentRepo.GetByID(comment.ID)
}

func (s *commentService) GetByActivityID(activityID uint) ([]model.Comment, error) {
	comments, err := s.commentRepo.GetByActivityID(activityID)
	if err != nil {
		return nil, err
	}

	s.populateAuthorRatings(comments)
	return comments, nil
}

func (s *commentService) GetByWorkID(workID uint) ([]model.Comment, error) {
	comments, err := s.commentRepo.GetByWorkID(workID)
	if err != nil {
		return nil, err
	}

	s.populateAuthorRatings(comments)
	return comments, nil
}

// populateAuthorRatings batch-fetches average ratings for all comment authors
// in a single query, avoiding the N+1 problem.
func (s *commentService) populateAuthorRatings(comments []model.Comment) {
	if len(comments) == 0 {
		return
	}

	userIDs := make([]uint, 0, len(comments))
	seen := make(map[uint]bool)
	for _, c := range comments {
		if !seen[c.UserID] {
			userIDs = append(userIDs, c.UserID)
			seen[c.UserID] = true
		}
	}

	avgMap, err := s.ratingRepo.GetAveragesByUserIDs(userIDs)
	if err != nil {
		return
	}

	for i := range comments {
		comments[i].User.AverageRating = avgMap[comments[i].UserID]
	}
}

func (s *commentService) Delete(commentID, userID uint) error {
	comment, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "comment not found")
	}

	if comment.UserID != userID {
		return apperror.New(apperror.CodeForbidden, "only the comment author can delete this comment")
	}

	// Decrement denormalized count if this is a work comment
	if comment.WorkID != nil {
		if err := s.workRepo.DecrementCommentCount(*comment.WorkID); err != nil {
			logger.Warn("failed to decrement comment count", "workID", *comment.WorkID, "error", err)
		}
	}

	return s.commentRepo.Delete(commentID)
}
