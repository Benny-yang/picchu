package model

import "time"

// Rating represents a peer rating between participants after an activity.
type Rating struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActivityID uint      `gorm:"column:activity_id;not null;uniqueIndex:idx_activity_rater_target" json:"activityId"`
	RaterID    uint      `gorm:"column:rater_id;not null;uniqueIndex:idx_activity_rater_target;index" json:"raterId"`
	TargetID   uint      `gorm:"column:target_id;not null;uniqueIndex:idx_activity_rater_target;index" json:"targetId"`
	Score      int       `gorm:"column:score;not null" json:"score"` // 1-5
	Comment    string    `gorm:"column:comment;type:text" json:"comment"`
	CreatedAt  time.Time `json:"createdAt"`

	// Relationships
	Activity Activity `gorm:"foreignKey:ActivityID" json:"activity,omitempty"`
	Rater    User     `gorm:"foreignKey:RaterID" json:"rater,omitempty"`
	Target   User     `gorm:"foreignKey:TargetID" json:"target,omitempty"`
}

// TableName overrides the table name.
func (Rating) TableName() string {
	return "ratings"
}
