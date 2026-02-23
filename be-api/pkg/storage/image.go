package storage

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"cloud.google.com/go/storage"
)

// SaveBase64Image decodes base64 image data, saves it to disk or GCS under the
// specified category directory, and returns the publicly accessible URL.
//
// Parameters:
//   - baseURL:   API base URL (e.g. "http://localhost:8080"). Unused if using GCS.
//   - bucketName: GCS bucket name. If empty, falls back to local storage.
//   - category:  subdirectory name under "uploads" (e.g. "avatars", "works", "activities")
//   - ownerID:   user or resource owner ID, used for filename uniqueness
//   - base64Data: raw base64-encoded image string
//   - index:     image index within a batch upload (use 0 for single images)
func SaveBase64Image(baseURL, bucketName, category string, ownerID uint, base64Data string, index int) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", errors.New("invalid base64 image data")
	}

	fileName := fmt.Sprintf("%s_%d_%d_%d.jpg", category, ownerID, time.Now().Unix(), index)

	// Local Storage Fallback
	if bucketName == "" {
		filePath := filepath.Join("uploads", category, fileName)

		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			return "", fmt.Errorf("failed to create %s directory: %w", category, err)
		}

		if err := os.WriteFile(filePath, data, 0644); err != nil {
			return "", fmt.Errorf("failed to save %s image: %w", category, err)
		}

		return fmt.Sprintf("%s/uploads/%s/%s", baseURL, category, fileName), nil
	}

	// GCS Upload
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("storage.NewClient: %w", err)
	}
	defer client.Close()

	// e.g. "avatars/avatar_1_123456789_0.jpg"
	gcsPath := fmt.Sprintf("%s/%s", category, fileName)

	// Since Cloud Run runs with default compute service account, it will automatically authenticate.
	wc := client.Bucket(bucketName).Object(gcsPath).NewWriter(ctx)
	// We do not manage ACLs directly here because the bucket will be created as "uniform bucket-level access"
	wc.ContentType = "image/jpeg"
	wc.CacheControl = "public, max-age=31536000"

	if _, err := wc.Write(data); err != nil {
		return "", fmt.Errorf("failed to write to GCS: %w", err)
	}
	if err := wc.Close(); err != nil {
		return "", fmt.Errorf("failed to close GCS writer: %w", err)
	}

	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, gcsPath), nil
}
