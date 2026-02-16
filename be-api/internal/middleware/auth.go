package middleware

import (
	"net/http"
	"strings"

	"azure-magnetar/pkg/auth"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

const bearerPrefix = "Bearer "

// AuthRequired is a Gin middleware that enforces JWT authentication.
// It extracts the user ID from the token and stores it in the context as "userID".
func AuthRequired(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := extractUserID(c, jwtSecret)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}

// AuthOptional is a Gin middleware that optionally parses JWT.
// If a valid token is present, userID is set in the context.
// If no token or an invalid token is present, the request continues without userID.
func AuthOptional(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := extractUserID(c, jwtSecret)
		if err == nil {
			c.Set("userID", userID)
		}
		c.Next()
	}
}

// GetCurrentUserID extracts the authenticated user ID from the Gin context.
// Returns 0 if no user is authenticated.
func GetCurrentUserID(c *gin.Context) uint {
	val, exists := c.Get("userID")
	if !exists {
		return 0
	}
	id, ok := val.(uint)
	if !ok {
		return 0
	}
	return id
}

// extractUserID parses the Bearer token from the Authorization header.
func extractUserID(c *gin.Context, jwtSecret string) (uint, error) {
	header := c.GetHeader("Authorization")
	if header == "" {
		return 0, auth.ErrMissingToken
	}

	if !strings.HasPrefix(header, bearerPrefix) {
		return 0, auth.ErrInvalidToken
	}

	tokenString := strings.TrimPrefix(header, bearerPrefix)
	return auth.ParseToken(tokenString, jwtSecret)
}
