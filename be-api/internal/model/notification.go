package model

import "time"

// Notification represents a notification sent to a user.
type Notification struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"column:user_id;not null;index" json:"userId"`     // Recipient
	ActorID     uint      `gorm:"column:actor_id;not null;index" json:"actorId"`   // Who triggered it
	Type        string    `gorm:"column:type;size:100;not null" json:"type"`       // applicant, status_change, comment, like
	ReferenceID string    `gorm:"column:reference_id;size:255" json:"referenceId"` // Related entity ID
	Content     string    `gorm:"column:content;type:text" json:"content"`         // Snapshot of content (e.g. Activity Title)
	IsRead      bool      `gorm:"column:is_read;default:false" json:"isRead"`
	CreatedAt   time.Time `json:"createdAt"`

	// Relationships
	User  User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Actor User `gorm:"foreignKey:ActorID" json:"actor,omitempty"`
}

// TableName overrides the table name.
func (Notification) TableName() string {
	return "notifications"
}
