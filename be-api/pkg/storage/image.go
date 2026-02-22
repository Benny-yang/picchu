package storage

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// SaveBase64Image decodes base64 image data, saves it to disk under the
// specified category directory, and returns the publicly accessible URL.
//
// Parameters:
//   - baseURL:   API base URL (e.g. "http://localhost:8080")
//   - category:  subdirectory name under "uploads" (e.g. "avatars", "works", "activities")
//   - ownerID:   user or resource owner ID, used for filename uniqueness
//   - base64Data: raw base64-encoded image string
//   - index:     image index within a batch upload (use 0 for single images)
func SaveBase64Image(baseURL, category string, ownerID uint, base64Data string, index int) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	fileName := fmt.Sprintf("%s_%d_%d_%d.jpg", category, ownerID, time.Now().Unix(), index)
	filePath := filepath.Join("uploads", category, fileName)

	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return "", fmt.Errorf("failed to create %s directory: %w", category, err)
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", errors.New("invalid base64 image data")
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to save %s image: %w", category, err)
	}

	return fmt.Sprintf("%s/uploads/%s/%s", baseURL, category, fileName), nil
}
