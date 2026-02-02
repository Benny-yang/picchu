package handler

import (
	"azure-magnetar/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	service *service.PostService
}

func NewPostHandler(service *service.PostService) *PostHandler {
	return &PostHandler{service: service}
}

// GetWall godoc
// @Summary Get Works Wall Posts
// @Description Get posts for trending or following wall with random seed cursor pagination
// @Tags posts
// @Accept json
// @Produce json
// @Param type query string false "Filter type: trending (default) or following"
// @Param seed query int false "Random seed for repeatable paging. If not provided, a new one is generated."
// @Param cursor query string false "Pagination cursor (base64 encoded offset)"
// @Param limit query int false "Limit per page (default 20)"
// @Success 200 {object} service.WallResponse
// @Router /posts/wall [get]
func (h *PostHandler) GetWall(c *gin.Context) {
	// 1. Parse Parameters
	filterType := c.DefaultQuery("type", "trending")
	limitStr := c.DefaultQuery("limit", "20")
	seedStr := c.DefaultQuery("seed", "")
	cursor := c.Query("cursor")

	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 20
	}

	var seed int64
	if seedStr != "" {
		s, err := strconv.ParseInt(seedStr, 10, 64)
		if err == nil {
			seed = s
		}
	}
	if seed == 0 {
		// Generate new seed if not provided
		seed = time.Now().UnixNano()
	}

	// 2. Get Current User (from Middleware)
	// Assuming "userID" is set in context by auth middleware
	// If context key is different, update here.
	var currentUserID uint
	if v, exists := c.Get("userID"); exists {
		// Type assertion depends on how middleware sets it. Assuming float64 or uint or string.
		// Adapt based on your Auth middleware.
		// Common in Gin JWT: float64 from claims
		switch val := v.(type) {
		case uint:
			currentUserID = val
		case float64:
			currentUserID = uint(val)
		case int:
			currentUserID = uint(val)
		}
	} else {
		// If not logged in & type=following, return empty or error?
		// User said "Auth: Must parse current_user_id". So 401 if missing?
		// But maybe trending is public? The ID is needed for following.
		// If Bearer token is valid, userID should be here.
		// If type=following and no user, return error.
		if filterType == "following" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	}

	// 3. Call Service
	resp, err := h.service.GetWall(filterType, seed, cursor, limit, currentUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
