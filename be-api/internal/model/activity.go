package model

import "time"

// Activity represents an event created by a host user.
type Activity struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	HostID              uint      `gorm:"column:host_id;not null;index" json:"hostId"`
	Title               string    `gorm:"column:title;size:255;not null" json:"title"`
	Description         string    `gorm:"column:description;type:text" json:"description"`
	Location            string    `gorm:"column:location;size:255" json:"location"`
	EventTime           time.Time `gorm:"column:event_time" json:"eventTime"`
	MaxParticipants     int       `gorm:"column:max_participants;default:0" json:"maxParticipants"`
	CurrentParticipants int64     `gorm:"-" json:"currentParticipants"`
	Status              string    `gorm:"column:status;size:50;default:'open'" json:"status"` // open, full, ended, cancelled
	Images              []string  `gorm:"serializer:json" json:"images"`                      // JSON array of image URLs
	Tags                string    `gorm:"column:tags;type:text" json:"tags"`                  // JSON array of tag strings
	Roles               []string  `gorm:"serializer:json" json:"roles"`                       // JSON array of required roles
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`

	// Relationships
	Host User `gorm:"foreignKey:HostID" json:"host,omitempty"`
}

// TableName overrides the table name.
func (Activity) TableName() string {
	return "activities"
}
