package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateSecureToken creates a cryptographically secure random hex token.
// byteLength specifies the number of random bytes (the resulting hex string
// will be 2× this length). A typical value is 32 (producing a 64-char token).
func GenerateSecureToken(byteLength int) (string, error) {
	tokenBytes := make([]byte, byteLength)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", fmt.Errorf("failed to generate secure token: %w", err)
	}
	return hex.EncodeToString(tokenBytes), nil
}
