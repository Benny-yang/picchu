package model

import "time"

// UserProfile struct definition
type UserProfile struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	UserID   uint   `gorm:"column:user_id;not null;uniqueIndex" json:"userId"`
	Username string `gorm:"column:username;size:255" json:"username"`

	Avatar         string    `gorm:"column:avatar;size:255" json:"avatar"`
	City           string    `gorm:"column:city;size:100" json:"city"`
	Gender         string    `gorm:"column:gender;size:20" json:"gender"`
	Phone          string    `gorm:"column:phone;size:50" json:"phone"`
	IsPhotographer bool      `gorm:"column:is_photographer;default:false" json:"isPhotographer"`
	IsModel        bool      `gorm:"column:is_model;default:false" json:"isModel"`
	Bio            string    `gorm:"column:bio;type:text" json:"bio"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName overrides the table name
func (UserProfile) TableName() string {
	return "user_profiles"
}
