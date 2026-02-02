package main

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// User struct (simplified)
type User struct {
	ID        uint   `gorm:"primaryKey"`
	UserName  string `gorm:"column:user_name"`
	Email     string `gorm:"column:email"`
	CreatedAt time.Time
}

func (User) TableName() string {
	return "users"
}

func main() {
	dsn := "root:aa14725766@tcp(127.0.0.1:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=Local"
	fmt.Printf("Connecting to DB with DSN: %s\n", dsn)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	var users []User
	result := db.Find(&users)
	if result.Error != nil {
		log.Fatalf("Failed to query users: %v", result.Error)
	}

	fmt.Printf("Found %d users:\n", len(users))
	for _, u := range users {
		fmt.Printf("ID: %d, Email: %s, UserName: %s, CreatedAt: %v\n", u.ID, u.Email, u.UserName, u.CreatedAt)
	}
}
