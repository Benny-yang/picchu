package service

import (
	"fmt"
	"time"

	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/email"
	"azure-magnetar/pkg/logger"
	"azure-magnetar/pkg/storage"
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
	ForgotPassword(email string) error
	ResetPassword(token, newPassword string) error
	VerifyEmail(token string) error
	ResendVerification(email string) error
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
	AverageRating  float64            `json:"averageRating"`
}

type userService struct {
	repo        repository.UserRepository
	followRepo  repository.FollowRepository
	ratingRepo  repository.RatingRepository
	apiBaseURL  string
	frontendURL string
}

// NewUserService creates a new UserService.
func NewUserService(repo repository.UserRepository, followRepo repository.FollowRepository, ratingRepo repository.RatingRepository, apiBaseURL, frontendURL string) UserService {
	return &userService{
		repo:        repo,
		followRepo:  followRepo,
		ratingRepo:  ratingRepo,
		apiBaseURL:  apiBaseURL,
		frontendURL: frontendURL,
	}
}

func (s *userService) Register(emailStr, password string) error {
	if _, err := s.repo.GetByEmail(emailStr); err == nil {
		return apperror.New(apperror.CodeConflict, "此 email 已註冊")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	verificationToken, err := utils.GenerateSecureToken(32)
	if err != nil {
		return err
	}

	user := &model.User{
		UserName:          emailStr,
		Email:             emailStr,
		Password:          hashedPassword,
		IsVerified:        false,
		VerificationToken: verificationToken,
	}

	if err := s.repo.Create(user); err != nil {
		return err
	}

	verifyLink := fmt.Sprintf("%s/api/v1/auth/verify?token=%s", s.apiBaseURL, verificationToken)

	go func() {
		if err := email.SendVerificationEmail(user.Email, verifyLink); err != nil {
			logger.Error("failed to send verification email", "email", user.Email, "error", err)
		}
	}()

	return nil
}

func (s *userService) Login(email, password string) (*model.User, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, apperror.New(apperror.CodeUnauthorized, "此帳號不存在")
	}

	if !utils.CheckPassword(password, user.Password) {
		return nil, apperror.New(apperror.CodeUnauthorized, "密碼錯誤")
	}

	if !user.IsVerified {
		return nil, apperror.New(apperror.CodeForbidden, "請先驗證您的信箱")
	}

	return user, nil
}

func (s *userService) GetUser(id uint) (*model.User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if avg, err := s.ratingRepo.GetAverageByUserID(id); err == nil {
		user.AverageRating = avg
	}
	return user, nil
}

func (s *userService) GetUserWithProfile(id uint) (*UserProfileResponse, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	profile, _ := s.repo.GetProfileByUserID(id)

	followerCount, _ := s.followRepo.CountFollowers(id)
	followingCount, _ := s.followRepo.CountFollowing(id)
	var averageRating float64
	if avg, err := s.ratingRepo.GetAverageByUserID(id); err == nil {
		averageRating = avg
	}

	return &UserProfileResponse{
		ID:             user.ID,
		Email:          user.Email,
		Username:       user.UserName,
		Profile:        profile,
		FollowerCount:  followerCount,
		FollowingCount: followingCount,
		AverageRating:  averageRating,
	}, nil
}

func (s *userService) ListUsers() ([]model.User, error) {
	return s.repo.GetAll()
}

func (s *userService) UpdateProfile(userID uint, input UpdateProfileInput) (*model.UserProfile, error) {
	if !input.IsPhotographer && !input.IsModel {
		return nil, apperror.New(apperror.CodeValidation, "at least one role (photographer or model) must be selected")
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
		avatarURL, err := storage.SaveBase64Image(s.apiBaseURL, "avatars", userID, input.AvatarBase64, 0)
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

	profile.Phone = input.Phone
	profile.IsPhotographer = input.IsPhotographer
	profile.IsModel = input.IsModel
	profile.Bio = input.Bio

	if err := s.repo.UpdateProfile(profile); err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return profile, nil
}

func (s *userService) ForgotPassword(emailStr string) error {
	user, err := s.repo.GetByEmail(emailStr)
	if err != nil {
		// Security: return nil to prevent email enumeration attacks
		return nil
	}

	token, err := utils.GenerateSecureToken(32)
	if err != nil {
		return err
	}

	expiry := time.Now().Add(1 * time.Hour)

	user.ResetToken = token
	user.ResetTokenExpiry = &expiry
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	resetLink := fmt.Sprintf("%s?view=reset-password&token=%s", s.frontendURL, token)

	go func() {
		if err := email.SendPasswordResetEmail(user.Email, resetLink); err != nil {
			logger.Error("failed to send reset email", "email", user.Email, "error", err)
		}
	}()

	return nil
}

func (s *userService) ResetPassword(token, newPassword string) error {
	user, err := s.repo.GetByResetToken(token)
	if err != nil {
		return apperror.New(apperror.CodeValidation, "無效或已過期的重設連結")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user.Password = hashedPassword
	user.ResetToken = ""
	user.ResetTokenExpiry = nil
	return s.repo.UpdateUser(user)
}

func (s *userService) VerifyEmail(token string) error {
	user, err := s.repo.GetByVerificationToken(token)
	if err != nil {
		return apperror.New(apperror.CodeValidation, "無效的驗證連結")
	}

	if user.IsVerified {
		return apperror.New(apperror.CodeConflict, "信箱已驗證")
	}

	user.IsVerified = true
	user.VerificationToken = "" // Clear token
	return s.repo.UpdateUser(user)
}

func (s *userService) ResendVerification(emailStr string) error {
	user, err := s.repo.GetByEmail(emailStr)
	if err != nil {
		return apperror.New(apperror.CodeNotFound, "此信箱未註冊")
	}

	if user.IsVerified {
		return apperror.New(apperror.CodeConflict, "此信箱已驗證，請直接登入")
	}

	verificationToken, err := utils.GenerateSecureToken(32)
	if err != nil {
		return err
	}

	user.VerificationToken = verificationToken
	if err := s.repo.UpdateUser(user); err != nil {
		return fmt.Errorf("failed to update user token: %w", err)
	}

	verifyLink := fmt.Sprintf("%s/api/v1/auth/verify?token=%s", s.apiBaseURL, verificationToken)

	go func() {
		if err := email.SendVerificationEmail(user.Email, verifyLink); err != nil {
			logger.Error("failed to resend verification email", "email", user.Email, "error", err)
		}
	}()

	return nil
}
