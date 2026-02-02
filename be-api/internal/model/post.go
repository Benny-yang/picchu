package model

import "time"

// Post struct definition
type Post struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index;not null" json:"userId"`
	ImageURL    string    `gorm:"column:image_url;size:1024;not null" json:"imageUrl"`
	AspectRatio float64   `gorm:"column:aspect_ratio;not null;default:1.0" json:"aspectRatio"`
	Title       string    `gorm:"size:255" json:"title"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	// Relationships
	Author User `gorm:"foreignKey:UserID" json:"author"`
}

func (Post) TableName() string {
	return "posts"
}
