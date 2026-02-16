package model

import "time"

// Follow struct definition
type Follow struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FollowerID  uint      `gorm:"column:follower_id;not null;uniqueIndex:idx_follower_following" json:"followerId"`
	FollowingID uint      `gorm:"column:following_id;not null;uniqueIndex:idx_follower_following" json:"followingId"`
	CreatedAt   time.Time `json:"createdAt"`

	// Relationships
	Follower  User `gorm:"foreignKey:FollowerID" json:"follower,omitempty"`
	Following User `gorm:"foreignKey:FollowingID" json:"following,omitempty"`
}

func (Follow) TableName() string {
	return "follows"
}
