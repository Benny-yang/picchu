package model

import "time"

// UserProfile struct definition
type UserProfile struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"column:user_id;not null;uniqueIndex" json:"userId"`

	DisplayName string `gorm:"column:display_name;size:255" json:"displayName"`
	Username    string `gorm:"column:username;size:255" json:"username"`
	AvatarURL   string `gorm:"column:avatar_url;size:255" json:"avatarUrl"`
	Bio         string `gorm:"column:bio;type:text" json:"bio"`
	Roles       string `gorm:"column:roles;type:text" json:"roles"` // JSON array, e.g. ["model", "photographer"]
	Gender      string `gorm:"column:gender;size:20" json:"gender"`
	City        string `gorm:"column:city;size:100" json:"city"`
	Phone       string `gorm:"column:phone;size:50" json:"phone"`

	// Legacy boolean fields kept for backward compatibility
	IsPhotographer bool `gorm:"column:is_photographer;default:false" json:"isPhotographer"`
	IsModel        bool `gorm:"column:is_model;default:false" json:"isModel"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName overrides the table name
func (UserProfile) TableName() string {
	return "user_profiles"
}
