package model

import "time"

// Comment represents a user comment on an activity or a work (post).
type Comment struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActivityID *uint     `gorm:"column:activity_id;index" json:"activityId,omitempty"` // Nullable
	WorkID     *uint     `gorm:"column:work_id;index" json:"workId,omitempty"`         // Nullable (references posts.id)
	UserID     uint      `gorm:"column:user_id;not null;index" json:"userId"`
	Content    string    `gorm:"column:content;type:text;not null" json:"content"`
	CreatedAt  time.Time `json:"createdAt"`

	// Relationships
	User     User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Activity *Activity `gorm:"foreignKey:ActivityID" json:"activity,omitempty"`
	Work     *Post     `gorm:"foreignKey:WorkID" json:"work,omitempty"`
}

// TableName overrides the table name.
func (Comment) TableName() string {
	return "comments"
}
