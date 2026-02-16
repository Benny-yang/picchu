package main

import (
	"fmt"
	"log"

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

	var activities []model.Activity
	if err := db.Order("updated_at DESC").Limit(5).Find(&activities).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Println("--- Recent Activities Diagnostics ---")
	for _, a := range activities {
		var accepted int64
		db.Model(&model.ActivityParticipant{}).Where("activity_id = ? AND status = ?", a.ID, "accepted").Count(&accepted)

		var pending int64
		db.Model(&model.ActivityParticipant{}).Where("activity_id = ? AND status = ?", a.ID, "pending").Count(&pending)

		fmt.Printf("ID: %d | Title: %s | Status: %s | Max: %d | Current(Calc): %d | Pending: %d\n",
			a.ID, a.Title, a.Status, a.MaxParticipants, accepted, pending)
	}
	fmt.Println("-------------------------------------")
}
