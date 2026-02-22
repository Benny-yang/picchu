package auth_test

import (
	"testing"

	"azure-magnetar/pkg/auth"
)

const testSecret = "test-secret-key-for-unit-tests"

func TestGenerateAndParseToken(t *testing.T) {
	userID := uint(42)

	token, err := auth.GenerateToken(userID, testSecret, auth.TokenExpiry)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if token == "" {
		t.Fatal("GenerateToken returned empty token")
	}

	parsedID, err := auth.ParseToken(token, testSecret)
	if err != nil {
		t.Fatalf("ParseToken failed: %v", err)
	}
	if parsedID != userID {
		t.Errorf("ParseToken returned userID %d, want %d", parsedID, userID)
	}
}

func TestParseTokenWithWrongSecret(t *testing.T) {
	userID := uint(42)

	token, err := auth.GenerateToken(userID, testSecret, auth.TokenExpiry)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	_, err = auth.ParseToken(token, "wrong-secret")
	if err == nil {
		t.Fatal("ParseToken should fail with wrong secret")
	}
}

func TestParseTokenWithInvalidString(t *testing.T) {
	_, err := auth.ParseToken("not-a-valid-token", testSecret)
	if err == nil {
		t.Fatal("ParseToken should fail with invalid token string")
	}
}

func TestParseTokenWithEmptyString(t *testing.T) {
	_, err := auth.ParseToken("", testSecret)
	if err == nil {
		t.Fatal("ParseToken should fail with empty token string")
	}
}

func TestGenerateTokenDifferentUsers(t *testing.T) {
	token1, _ := auth.GenerateToken(1, testSecret, auth.TokenExpiry)
	token2, _ := auth.GenerateToken(2, testSecret, auth.TokenExpiry)

	if token1 == token2 {
		t.Fatal("Different users should produce different tokens")
	}

	id1, _ := auth.ParseToken(token1, testSecret)
	id2, _ := auth.ParseToken(token2, testSecret)

	if id1 != 1 || id2 != 2 {
		t.Errorf("Token IDs mismatch: got %d and %d", id1, id2)
	}
}
