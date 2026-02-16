package service

import (
	"errors"
	"fmt"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
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
}

// NewCommentService creates a new CommentService.
func NewCommentService(commentRepo repository.CommentRepository, workRepo repository.WorkRepository) CommentService {
	return &commentService{commentRepo: commentRepo, workRepo: workRepo}
}

func (s *commentService) CreateForActivity(activityID, userID uint, content string) (*model.Comment, error) {
	if content == "" {
		return nil, errors.New("comment content is required")
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
		// Log but don't fail the request
		fmt.Printf("warning: failed to increment comment count for work %d: %v\n", workID, err)
	}

	return s.commentRepo.GetByID(comment.ID)
}

func (s *commentService) GetByActivityID(activityID uint) ([]model.Comment, error) {
	return s.commentRepo.GetByActivityID(activityID)
}

func (s *commentService) GetByWorkID(workID uint) ([]model.Comment, error) {
	return s.commentRepo.GetByWorkID(workID)
}

func (s *commentService) Delete(commentID, userID uint) error {
	comment, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return errors.New("comment not found")
	}

	if comment.UserID != userID {
		return errors.New("only the comment author can delete this comment")
	}

	// Decrement denormalized count if this is a work comment
	if comment.WorkID != nil {
		if err := s.workRepo.DecrementCommentCount(*comment.WorkID); err != nil {
			fmt.Printf("warning: failed to decrement comment count for work %d: %v\n", *comment.WorkID, err)
		}
	}

	return s.commentRepo.Delete(commentID)
}
