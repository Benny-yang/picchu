package main

import (
	"azure-magnetar/pkg/email"
	"fmt"
	"log"
	"os"
)

func main() {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY is not set in environment variables")
	}

	toEmail := "cfst906609@gmail.com"
	resetLink := "https://vibecoding.com/reset-password?token=test-token"

	fmt.Printf("Attempting to send test email to %s...\n", toEmail)

	err := email.SendPasswordResetEmail(toEmail, resetLink)
	if err != nil {
		log.Fatalf("Failed to send email: %v", err)
	}

	fmt.Println("Email sent successfully!")
}
