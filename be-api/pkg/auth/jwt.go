package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenExpiry defines the JWT token validity duration.
const TokenExpiry = 24 * time.Hour

var (
	ErrInvalidToken = errors.New("invalid or expired token")
	ErrMissingToken = errors.New("authorization token is required")
)

// Claims defines the JWT custom claims structure.
type Claims struct {
	UserID uint `json:"userId"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT for the given user ID.
func GenerateToken(userID uint, secret string, duration time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(duration)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken validates a JWT string and returns the embedded user ID.
func ParseToken(tokenString, secret string) (uint, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(secret), nil
	})
	if err != nil {
		return 0, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return 0, ErrInvalidToken
	}

	return claims.UserID, nil
}
