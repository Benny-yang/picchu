package handler

import (
	"net/http"
	"strconv"

	"azure-magnetar/config"
	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/auth"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// UserHandler handles user-related HTTP requests.
// UserHandler handles user-related HTTP requests.
type UserHandler struct {
	userService     service.UserService
	followService   service.FollowService
	workService     service.WorkService
	activityService service.ActivityService
	ratingService   service.RatingService
}

// NewUserHandler creates a new UserHandler with the given user service.
func NewUserHandler(
	userService service.UserService,
	followService service.FollowService,
	workService service.WorkService,
	activityService service.ActivityService,
	ratingService service.RatingService,
) *UserHandler {
	return &UserHandler{
		userService:     userService,
		followService:   followService,
		workService:     workService,
		activityService: activityService,
		ratingService:   ratingService,
	}
}

// --- Input DTOs ---

// RegisterInput represents the registration request body.
type RegisterInput struct {
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

// LoginInput represents the login request body.
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse is returned on successful login.
type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

// --- Auth Endpoints ---

// Register godoc
// @Summary      Register a new user
// @Description  Create a new user account with email and password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body RegisterInput true "Register Input"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      500  {object}  response.Response
// @Router       /auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.userService.Register(input.Email, input.Password); err != nil {
		if err.Error() == "此 email 已註冊" {
			response.Error(c, http.StatusBadRequest, err.Error())
		} else {
			response.Error(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	response.Success(c, "Account created successfully")
}

// Login godoc
// @Summary      Login user
// @Description  Authenticate user with email and password, returns JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body LoginInput true "Login Input"
// @Success      200  {object}  response.Response{data=LoginResponse}
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.userService.Login(input.Email, input.Password)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	cfg := config.LoadConfig()
	token, err := auth.GenerateToken(user.ID, cfg.JWTSecret)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	response.Success(c, LoginResponse{
		Token: token,
		User:  user,
	})
}

// --- Current User Endpoints ---

// GetMe godoc
// @Summary      Get current user profile
// @Description  Get the authenticated user's profile including stats
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /users/me [get]
func (h *UserHandler) GetMe(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	user, err := h.userService.GetUserWithProfile(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	// Prevent caching of current user data
	c.Header("Cache-Control", "no-store")
	response.Success(c, user)
}

// UpdateMe godoc
// @Summary      Update current user profile
// @Description  Update the authenticated user's profile
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        input body service.UpdateProfileInput true "Profile Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      500  {object}  response.Response
// @Router       /users/me [put]
func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var input service.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.userService.UpdateProfile(userID, input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, profile)
}

// --- Public User Endpoints ---

// GetUser godoc
// @Summary      Get public user profile by ID
// @Description  Get user details, profile, and stats by user ID
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Router       /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	user, err := h.userService.GetUserWithProfile(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	response.Success(c, user)
}

// GetUserWorks godoc
// @Summary      Get user's works
// @Description  Get portfolio/works by user ID
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /users/{id}/works [get]
func (h *UserHandler) GetUserWorks(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	works, err := h.workService.GetByUserID(id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, works)
}

// GetUserActivities godoc
// @Summary      Get user's activities
// @Description  Get activities hosted or joined by user ID
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /users/{id}/activities [get]
func (h *UserHandler) GetUserActivities(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	activities, err := h.activityService.GetByUserID(id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, activities)
}

// GetUserReviews godoc
// @Summary      Get user's received reviews
// @Description  Get reviews/ratings received by user ID
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /users/{id}/reviews [get]
func (h *UserHandler) GetUserReviews(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	reviews, err := h.ratingService.GetUserReviews(id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, reviews)
}

// GetMyApplications godoc
// @Summary      Get current user's activity applications
// @Description  Get all activity applications for the authenticated user
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  response.Response
// @Router       /users/me/applications [get]
func (h *UserHandler) GetMyApplications(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	applications, err := h.activityService.GetMyApplications(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, applications)
}

// --- Helpers ---

// parseIDParam extracts and validates a uint path parameter.
func parseIDParam(c *gin.Context, paramName string) (uint, error) {
	idStr := c.Param(paramName)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}
