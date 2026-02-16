package main

import (
	"fmt"
	"log"
	"time"

	"azure-magnetar/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:aa14725766@tcp(127.0.0.1:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Create a test user if not exists (simplified, assuming user 1 exists or using random)
	db.AutoMigrate(&model.Activity{})

	// Create a test activity
	activity := model.Activity{
		HostID:          1, // Assuming user 1 exists
		Title:           "Test Activity GORM",
		Description:     "Testing MaxParticipants",
		EventTime:       time.Now().Add(24 * time.Hour),
		MaxParticipants: 1,
		Status:          "open",
	}

	if err := db.Create(&activity).Error; err != nil {
		log.Fatalf("Failed to create activity: %v", err)
	}
	fmt.Printf("Created Activity ID: %d, MaxParticipants: %d\n", activity.ID, activity.MaxParticipants)

	// Update to 2
	activity.MaxParticipants = 2
	if err := db.Save(&activity).Error; err != nil {
		log.Fatalf("Failed to update activity: %v", err)
	}
	fmt.Printf("Updated (memory) Activity ID: %d, MaxParticipants: %d\n", activity.ID, activity.MaxParticipants)

	// Read back
	var refetched model.Activity
	if err := db.First(&refetched, activity.ID).Error; err != nil {
		log.Fatalf("Failed to fetch activity: %v", err)
	}
	fmt.Printf("Refetched Activity ID: %d, MaxParticipants: %d\n", refetched.ID, refetched.MaxParticipants)

	// Update to 3
	refetched.MaxParticipants = 3
	if err := db.Save(&refetched).Error; err != nil {
		log.Fatalf("Failed to update activity to 3: %v", err)
	}

	// Read back again
	var finalFetch model.Activity
	if err := db.First(&finalFetch, activity.ID).Error; err != nil {
		log.Fatalf("Failed to fetch activity final: %v", err)
	}
	fmt.Printf("Final Activity ID: %d, MaxParticipants: %d\n", finalFetch.ID, finalFetch.MaxParticipants)

	// Clean up
	// db.Delete(&activity)
}
