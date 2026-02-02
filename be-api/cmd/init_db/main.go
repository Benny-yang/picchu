package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// Connect to MySQL without database name
	dsn := "root:aa14725766@tcp(127.0.0.1:3306)/"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create database if not exists
	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS azure_magnetar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Database azure_magnetar created or already exists")
}
