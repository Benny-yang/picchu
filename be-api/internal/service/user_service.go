package service

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/utils"
)

// UserService defines the interface for user-related business logic.
type UserService interface {
	Register(email, password string) error
	Login(email, password string) (*model.User, error)
	GetUser(id uint) (*model.User, error)
	GetUserWithProfile(id uint) (*UserProfileResponse, error)
	ListUsers() ([]model.User, error)
	UpdateProfile(userID uint, input UpdateProfileInput) (*model.UserProfile, error)
}

// UpdateProfileInput represents the data for profile updates.
type UpdateProfileInput struct {
	Username       string `json:"username"`
	AvatarBase64   string `json:"avatarBase64"`
	City           string `json:"city"`
	Gender         string `json:"gender"`
	Phone          string `json:"phone"`
	IsPhotographer bool   `json:"isPhotographer"`
	IsModel        bool   `json:"isModel"`
	Bio            string `json:"bio"`
}

// UserProfileResponse combines user, profile, and stats for API response.
type UserProfileResponse struct {
	ID             uint               `json:"id"`
	Email          string             `json:"email"`
	Username       string             `json:"username"`
	Profile        *model.UserProfile `json:"profile"`
	FollowerCount  int64              `json:"followerCount"`
	FollowingCount int64              `json:"followingCount"`
}

type userService struct {
	repo       repository.UserRepository
	followRepo repository.FollowRepository
}

// NewUserService creates a new UserService.
func NewUserService(repo repository.UserRepository, followRepo repository.FollowRepository) UserService {
	return &userService{
		repo:       repo,
		followRepo: followRepo,
	}
}

func (s *userService) Register(email, password string) error {
	if _, err := s.repo.GetByEmail(email); err == nil {
		return errors.New("此 email 已註冊")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		UserName: email,
		Email:    email,
		Password: hashedPassword,
	}

	return s.repo.Create(user)
}

func (s *userService) Login(email, password string) (*model.User, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, errors.New("此帳號不存在")
	}

	if !utils.CheckPassword(password, user.Password) {
		return nil, errors.New("密碼錯誤")
	}

	return user, nil
}

func (s *userService) GetUser(id uint) (*model.User, error) {
	return s.repo.GetByID(id)
}

func (s *userService) GetUserWithProfile(id uint) (*UserProfileResponse, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	profile, _ := s.repo.GetProfileByUserID(id)

	followerCount, _ := s.followRepo.CountFollowers(id)
	followingCount, _ := s.followRepo.CountFollowing(id)

	return &UserProfileResponse{
		ID:             user.ID,
		Email:          user.Email,
		Username:       user.UserName,
		Profile:        profile,
		FollowerCount:  followerCount,
		FollowingCount: followingCount,
	}, nil
}

func (s *userService) ListUsers() ([]model.User, error) {
	return s.repo.GetAll()
}

func (s *userService) UpdateProfile(userID uint, input UpdateProfileInput) (*model.UserProfile, error) {
	if !input.IsPhotographer && !input.IsModel {
		return nil, errors.New("at least one role (photographer or model) must be selected")
	}

	if input.Gender == "" {
		return nil, errors.New("gender is required")
	}

	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	profile, err := s.repo.GetProfileByUserID(userID)
	if err != nil {
		profile = &model.UserProfile{UserID: userID}
	}

	if input.AvatarBase64 != "" {
		avatarURL, err := saveAvatarFromBase64(userID, input.AvatarBase64)
		if err != nil {
			return nil, fmt.Errorf("failed to save avatar: %w", err)
		}
		profile.AvatarURL = avatarURL
	}

	if input.Username != "" {
		user.UserName = input.Username
		profile.Username = input.Username
		if err := s.repo.UpdateUser(user); err != nil {
			return nil, fmt.Errorf("failed to update username: %w", err)
		}
	}

	profile.City = input.City
	profile.Gender = input.Gender
	profile.Phone = input.Phone
	profile.IsPhotographer = input.IsPhotographer
	profile.IsModel = input.IsModel
	profile.Bio = input.Bio

	if err := s.repo.UpdateProfile(profile); err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return profile, nil
}

// saveAvatarFromBase64 decodes base64 image data and saves it to disk.
func saveAvatarFromBase64(userID uint, base64Data string) (string, error) {
	fileName := fmt.Sprintf("avatar_%d_%d.jpg", userID, time.Now().Unix())
	filePath := filepath.Join("uploads", "avatars", fileName)

	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return "", fmt.Errorf("failed to create avatar directory: %w", err)
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", errors.New("invalid base64 avatar data")
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to save avatar: %w", err)
	}

	// Return full URL (assuming backend is at localhost:8080)
	// In production, this should be configurable
	return fmt.Sprintf("http://localhost:8080/uploads/avatars/%s", fileName), nil
}
