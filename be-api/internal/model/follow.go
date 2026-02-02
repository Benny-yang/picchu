package model

import "time"

// Follow struct definition
type Follow struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FollowerID uint      `gorm:"index;not null" json:"followerId"`
	FollowedID uint      `gorm:"index;not null" json:"followedId"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (Follow) TableName() string {
	return "follows"
}
