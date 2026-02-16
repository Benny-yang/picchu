package model

import "time"

// Post represents a work/portfolio item (maps to "posts" table, referred to as "Works" in the spec).
type Post struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"column:user_id;not null;index" json:"userId"`
	ImageURL     string    `gorm:"column:image_url;size:1024;not null" json:"imageUrl"`
	Images       []string  `gorm:"serializer:json" json:"images"`
	Description  string    `gorm:"column:description;type:text" json:"description"`
	Title        string    `gorm:"column:title;size:255" json:"title"`
	AspectRatio  float64   `gorm:"column:aspect_ratio;not null;default:1.0" json:"aspectRatio"`
	LikeCount    int       `gorm:"column:like_count;default:0" json:"likeCount"`
	CommentCount int       `gorm:"column:comment_count;default:0" json:"commentCount"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// Computed fields (not in DB)
	IsLiked bool `gorm:"-" json:"isLiked"`

	// Relationships
	Author User  `gorm:"foreignKey:UserID" json:"author"`
	Tags   []Tag `gorm:"many2many:post_tags;" json:"tags"`
}

func (Post) TableName() string {
	return "posts"
}
