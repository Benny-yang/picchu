package model

import "time"

// ActivityParticipant tracks user applications to activities.
type ActivityParticipant struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActivityID uint      `gorm:"column:activity_id;not null;index" json:"activityId"`
	UserID     uint      `gorm:"column:user_id;not null;index" json:"userId"`
	Status     string    `gorm:"column:status;size:50;default:'pending'" json:"status"` // pending, accepted, rejected
	Message    string    `gorm:"column:message;type:text" json:"message"`
	AppliedAt  time.Time `gorm:"column:applied_at;autoCreateTime" json:"appliedAt"`
	UpdatedAt  time.Time `json:"updatedAt"`

	// Relationships
	Activity Activity `gorm:"foreignKey:ActivityID" json:"activity,omitempty"`
	User     User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName overrides the table name.
func (ActivityParticipant) TableName() string {
	return "activity_participants"
}
