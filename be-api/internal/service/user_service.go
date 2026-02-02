package service

import (
	"errors"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/utils"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

type UserService interface {
	Register(email, password string) error
	Login(email, password string) (*model.User, error)
	CreateUser(user *model.User) error
	GetUser(id uint) (*model.User, error)
	ListUsers() ([]model.User, error)
	UpdateProfile(userID uint, input UpdateProfileInput) (*model.UserProfile, error)
}

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

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) Register(email, password string) error {
	// Check if email already exists
	if _, err := s.repo.GetByEmail(email); err == nil {
		return errors.New("此emai已註冊")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	user := &model.User{
		UserName: email, // Default username to email
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

func (s *userService) CreateUser(user *model.User) error {
	return s.repo.Create(user)
}

func (s *userService) GetUser(id uint) (*model.User, error) {
	return s.repo.GetByID(id)
}

func (s *userService) ListUsers() ([]model.User, error) {
	return s.repo.GetAll()
}

func (s *userService) UpdateProfile(userID uint, input UpdateProfileInput) (*model.UserProfile, error) {
	// 1. Validate Roles
	if !input.IsPhotographer && !input.IsModel {
		return nil, errors.New("at least one role (photographer or model) must be selected")
	}

	// 2. Validate Gender
	if input.Gender == "" {
		return nil, errors.New("gender is required")
	}

	// 3. Get User and Profile
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	profile, err := s.repo.GetProfileByUserID(userID)
	if err != nil {
		// Attempt to create if not exists
		profile = &model.UserProfile{UserID: userID}
		// If error is strictly "record not found" (depending on GORM config), logic might vary.
		// Assuming we proceed with profile struct.
	}

	// 4. Update Avatar if Base64 provided
	if input.AvatarBase64 != "" {
		// Define path
		fileName := fmt.Sprintf("avatar_%d_%d.jpg", userID, time.Now().Unix())
		filePath := filepath.Join("uploads", "avatars", fileName)

		// Decode
		data, err := base64.StdEncoding.DecodeString(input.AvatarBase64)
		if err != nil {
			return nil, errors.New("invalid base64 avatar")
		}

		// Save to file
		if err := os.WriteFile(filePath, data, 0644); err != nil {
			return nil, err
		}

		profile.Avatar = filePath
	}

	// 5. Update User Username (Display ID) and Profile Username
	if input.Username != "" {
		user.UserName = input.Username
		profile.Username = input.Username // Update profile username as well
		if err := s.repo.UpdateUser(user); err != nil {
			return nil, err
		}
	}

	// 6. Update Profile Fields
	profile.City = input.City
	profile.Gender = input.Gender
	profile.Phone = input.Phone
	profile.IsPhotographer = input.IsPhotographer
	profile.IsModel = input.IsModel
	profile.Bio = input.Bio

	if err := s.repo.UpdateProfile(profile); err != nil {
		return nil, err
	}

	return profile, nil
}
