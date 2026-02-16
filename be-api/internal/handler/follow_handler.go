package handler

import (
	"net/http"

	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// FollowHandler handles follow/unfollow HTTP requests.
type FollowHandler struct {
	followService service.FollowService
}

// NewFollowHandler creates a new FollowHandler.
func NewFollowHandler(followService service.FollowService) *FollowHandler {
	return &FollowHandler{followService: followService}
}

// Follow godoc
// @Summary      Follow a user
// @Description  Follow the specified user
// @Tags         users
// @Security     BearerAuth
// @Param        id path int true "Target User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /users/{id}/follow [post]
func (h *FollowHandler) Follow(c *gin.Context) {
	currentUserID := middleware.GetCurrentUserID(c)

	targetID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	if err := h.followService.FollowUser(currentUserID, targetID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "followed successfully")
}

// Unfollow godoc
// @Summary      Unfollow a user
// @Description  Unfollow the specified user
// @Tags         users
// @Security     BearerAuth
// @Param        id path int true "Target User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /users/{id}/follow [delete]
func (h *FollowHandler) Unfollow(c *gin.Context) {
	currentUserID := middleware.GetCurrentUserID(c)

	targetID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	if err := h.followService.UnfollowUser(currentUserID, targetID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "unfollowed successfully")
}

// CheckStatus godoc
// @Summary      Check follow status
// @Description  Check if the current user is following the target user
// @Tags         users
// @Produce      json
// @Param        id path int true "Target User ID"
// @Success      200  {object}  response.Response
// @Router       /users/{id}/follow [get]
func (h *FollowHandler) CheckStatus(c *gin.Context) {
	followerID := middleware.GetCurrentUserID(c)
	targetID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	isFollowing, err := h.followService.IsFollowing(followerID, targetID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{"isFollowing": isFollowing})
}

// GetFollowers godoc
// @Summary      Get user's followers
// @Description  Get list of users following the specified user
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /users/{id}/followers [get]
func (h *FollowHandler) GetFollowers(c *gin.Context) {
	targetID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	followers, err := h.followService.GetFollowers(targetID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, followers)
}

// GetFollowing godoc
// @Summary      Get user's following list
// @Description  Get list of users the specified user is following
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /users/{id}/following [get]
func (h *FollowHandler) GetFollowing(c *gin.Context) {
	targetID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	following, err := h.followService.GetFollowing(targetID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, following)
}
