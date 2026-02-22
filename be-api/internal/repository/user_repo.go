package repository

import (
	"azure-magnetar/internal/model"
	"time"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *model.User) error
	GetByID(id uint) (*model.User, error)
	GetByUsername(username string) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	GetByVerificationToken(token string) (*model.User, error)
	GetByResetToken(token string) (*model.User, error)
	GetAll() ([]model.User, error)
	GetProfileByUserID(userID uint) (*model.UserProfile, error)
	UpdateProfile(profile *model.UserProfile) error
	UpdateUser(user *model.User) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByUsername(username string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("user_name = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByVerificationToken(token string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("verification_token = ?", token).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByResetToken(token string) (*model.User, error) {
	var user model.User
	// Check for token match and expiry valid (expiry > now)
	if err := r.db.Where("reset_token = ? AND reset_token_expiry > ?", token, time.Now()).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetProfileByUserID(userID uint) (*model.UserProfile, error) {
	var profile model.UserProfile
	if err := r.db.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *userRepository) UpdateProfile(profile *model.UserProfile) error {
	if profile.ID == 0 {
		return r.db.Create(profile).Error
	}
	return r.db.Save(profile).Error
}

func (r *userRepository) UpdateUser(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) GetAll() ([]model.User, error) {
	var users []model.User
	if err := r.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
