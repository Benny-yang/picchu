package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"azure-magnetar/config"
	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/auth"
	"azure-magnetar/pkg/logger"
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
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"rememberMe"`
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
		HandleServiceError(c, err)
		return
	}

	response.Success(c, "Registration successful. Please check your email to verify your account.")
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
		HandleServiceError(c, err)
		return
	}

	cfg := config.LoadConfig()
	duration := auth.TokenExpiry
	if input.RememberMe {
		duration = 30 * 24 * time.Hour
	}

	token, err := auth.GenerateToken(user.ID, cfg.JWTSecret, duration)
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

// ForgotPasswordInput represents the request body for forgot password.
type ForgotPasswordInput struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordInput represents the request body for reset password.
type ResetPasswordInput struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// ForgotPassword godoc
// @Summary      Request password reset
// @Description  Send a password reset email to the user
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body ForgotPasswordInput true "Email"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      500  {object}  response.Response
// @Router       /auth/forgot-password [post]
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var input ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// ALWAYS return success to prevent email enumeration
	if err := h.userService.ForgotPassword(input.Email); err != nil {
		logger.Error("ForgotPassword failed", "email", input.Email, "error", err)
	}

	response.Success(c, "If the email exists, a password reset link has been sent.")
}

// ResetPassword godoc
// @Summary      Reset password
// @Description  Reset user password using a valid token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body ResetPasswordInput true "Reset Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      500  {object}  response.Response
// @Router       /auth/reset-password [post]
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var input ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.userService.ResetPassword(input.Token, input.NewPassword); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error()) // Or 400 if token invalid
		return
	}

	response.Success(c, "Password has been reset successfully.")
}

// VerifyEmail godoc
// @Summary      Verify email
// @Description  Verify user email with token
// @Tags         auth
// @Produce      json
// @Param        token query string true "Verification Token"
// @Success      302
// @Failure      400  {object}  response.Response
// @Router       /auth/verify [get]
func (h *UserHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		response.Error(c, http.StatusBadRequest, "token is required")
		return
	}

	if err := h.userService.VerifyEmail(token); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	frontendURL := config.LoadConfig().FrontendURL
	c.Redirect(http.StatusFound, fmt.Sprintf("%s?view=login&verified=true&first_login=true", frontendURL))
}

// ResendVerification godoc
// @Summary      Resend verification email
// @Description  Resend verification email to the user
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body ForgotPasswordInput true "Email"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /auth/resend-verification [post]
func (h *UserHandler) ResendVerification(c *gin.Context) {
	var input ForgotPasswordInput // Reuse struct containing Email
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.userService.ResendVerification(input.Email); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "Verification email sent.")
}
