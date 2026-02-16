package model

import "time"

// Like represents a user liking a work (post).
type Like struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:user_id;not null;uniqueIndex:idx_user_work" json:"userId"`
	WorkID    uint      `gorm:"column:work_id;not null;uniqueIndex:idx_user_work" json:"workId"` // references posts.id
	CreatedAt time.Time `json:"createdAt"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Work Post `gorm:"foreignKey:WorkID" json:"work,omitempty"`
}

// TableName overrides the table name.
func (Like) TableName() string {
	return "likes"
}
