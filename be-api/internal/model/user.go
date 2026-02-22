package model

import "time"

// User struct definition
type User struct {
	ID                uint        `gorm:"primaryKey" json:"id"`
	UserName          string      `gorm:"column:user_name;size:255;not null" json:"username"`
	Email             string      `gorm:"column:email;size:255;not null;uniqueIndex" json:"email"`
	Password          string      `gorm:"column:password;size:255;not null" json:"-"`
	Phone             string      `gorm:"column:phone;size:50" json:"phone"`
	IsPhotographer    bool        `gorm:"-" json:"isPhotographer"` // Derived from Profile, not persisted on User table
	Profile           UserProfile `gorm:"foreignKey:UserID" json:"profile"`
	AverageRating     float64     `gorm:"-" json:"averageRating"`
	ResetToken        string      `gorm:"column:reset_token;size:255" json:"-"`
	ResetTokenExpiry  *time.Time  `gorm:"column:reset_token_expiry" json:"-"`
	IsVerified        bool        `gorm:"column:is_verified;default:false" json:"isVerified"`
	VerificationToken string      `gorm:"column:verification_token;size:255" json:"-"`
	CreatedAt         time.Time   `json:"createdAt"`
	UpdatedAt         time.Time   `json:"updatedAt"`
}

// TableName overrides the table name used by User to `users`
func (User) TableName() string {
	return "users"
}
