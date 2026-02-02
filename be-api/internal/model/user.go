package model

import "time"

// User struct definition
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserName  string    `gorm:"column:user_name;size:255;not null" json:"userName"`
	Email     string    `gorm:"column:email;size:255;not null;unique" json:"email"`
	Password  string    `gorm:"column:password;size:255;not null" json:"-"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// TableName overrides the table name used by User to `users`
func (User) TableName() string {
	return "users"
}
