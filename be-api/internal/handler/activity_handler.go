package handler

import (
	"net/http"
	"strconv"

	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/repository"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// ActivityHandler handles activity-related HTTP requests.
type ActivityHandler struct {
	activityService service.ActivityService
	commentService  service.CommentService
	ratingService   service.RatingService
}

// NewActivityHandler creates a new ActivityHandler.
func NewActivityHandler(
	activityService service.ActivityService,
	commentService service.CommentService,
	ratingService service.RatingService,
) *ActivityHandler {
	return &ActivityHandler{
		activityService: activityService,
		commentService:  commentService,
		ratingService:   ratingService,
	}
}

// --- CRUD ---

// ListActivities godoc
// @Summary      List activities
// @Description  List activities with optional filters (location, date, tags)
// @Tags         activities
// @Produce      json
// @Param        location query string false "Filter by location"
// @Param        dateFrom query string false "Filter by start date"
// @Param        dateTo   query string false "Filter by end date"
// @Param        tags     query string false "Filter by tags"
// @Param        offset   query int    false "Offset for pagination"
// @Param        limit    query int    false "Limit per page"
// @Success      200  {object}  response.Response
// @Router       /activities [get]
func (h *ActivityHandler) ListActivities(c *gin.Context) {
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := repository.ActivityFilter{
		Location: c.Query("location"),
		DateFrom: c.Query("dateFrom"),
		DateTo:   c.Query("dateTo"),
		Tags:     c.Query("tags"),
		Offset:   offset,
		Limit:    limit,
	}

	activities, total, err := h.activityService.List(filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{
		"data":  activities,
		"total": total,
	})
}

// GetActivity godoc
// @Summary      Get activity details
// @Description  Get activity details by ID
// @Tags         activities
// @Produce      json
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Router       /activities/{id} [get]
func (h *ActivityHandler) GetActivity(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	activity, err := h.activityService.GetByID(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "activity not found")
		return
	}

	response.Success(c, activity)
}

// CreateActivity godoc
// @Summary      Create a new activity
// @Description  Create a new activity (authenticated)
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        input body service.CreateActivityInput true "Activity Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /activities [post]
func (h *ActivityHandler) CreateActivity(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var input service.CreateActivityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	activity, err := h.activityService.Create(userID, input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, activity)
}

// UpdateActivity godoc
// @Summary      Update activity
// @Description  Update activity details (host only)
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Activity ID"
// @Param        input body service.UpdateActivityInput true "Activity Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /activities/{id} [put]
func (h *ActivityHandler) UpdateActivity(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input service.UpdateActivityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	activity, err := h.activityService.Update(userID, activityID, input)
	if err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, activity)
}

// DeleteActivity godoc
// @Summary      Delete activity
// @Description  Delete/cancel activity (host only)
// @Tags         activities
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /activities/{id} [delete]
func (h *ActivityHandler) DeleteActivity(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	if err := h.activityService.Delete(userID, activityID); err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, "activity deleted")
}

// CancelActivityInput represents the reason for cancellation.
type CancelActivityInput struct {
	Reason string `json:"reason"`
}

// CancelActivity godoc
// @Summary      Cancel activity
// @Description  Cancel activity with reason (host only)
// @Tags         activities
// @Security     BearerAuth
// @Param        id    path int true "Activity ID"
// @Param        input body CancelActivityInput true "Cancellation Reason"
// @Success      200  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /activities/{id}/cancel [post]
func (h *ActivityHandler) CancelActivity(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input CancelActivityInput
	// Bind JSON body if present, but it's optional
	_ = c.ShouldBindJSON(&input)

	if err := h.activityService.Cancel(userID, activityID, input.Reason); err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, "activity cancelled")
}

// --- Participation ---

// ApplyToActivity godoc
// @Summary      Apply to join an activity
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Param        input body service.ApplyInput false "Application message"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /activities/{id}/apply [post]
func (h *ActivityHandler) ApplyToActivity(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input service.ApplyInput
	_ = c.ShouldBindJSON(&input) // message is optional

	if err := h.activityService.Apply(activityID, userID, input.Message); err != nil {
		HandleServiceError(c, err)
		return
	}

	response.Success(c, "application submitted")
}

// CancelApplication godoc
// @Summary      Cancel application
// @Tags         activities
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/apply [delete]
func (h *ActivityHandler) CancelApplication(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	if err := h.activityService.CancelApplication(activityID, userID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "application cancelled")
}

// GetApplicationStatus godoc
// @Summary      Get current user's status for an activity
// @Tags         activities
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/status [get]
func (h *ActivityHandler) GetApplicationStatus(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	status, err := h.activityService.GetUserStatus(activityID, userID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"status": status})
}

// InviteUser godoc
// @Summary      Invite a user to an activity
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path int true "Activity ID"
// @Param        input body service.InviteInput true "Invitation Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /activities/{id}/invite [post]
func (h *ActivityHandler) InviteUser(c *gin.Context) {
	hostID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input service.InviteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.activityService.InviteUser(activityID, hostID, input.UserID, input.Message); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "invitation sent")
}

// --- Host Management ---

// ListApplicants godoc
// @Summary      List applicants (host only)
// @Tags         activities
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /activities/{id}/applicants [get]
func (h *ActivityHandler) ListApplicants(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	applicants, err := h.activityService.ListApplicants(activityID, userID)
	if err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, applicants)
}

// UpdateApplicantStatus godoc
// @Summary      Update applicant status (host only)
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id     path int true "Activity ID"
// @Param        userId path int true "Applicant User ID"
// @Param        input  body service.UpdateApplicantStatusInput true "Status"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /activities/{id}/applicants/{userId}/status [put]
func (h *ActivityHandler) UpdateApplicantStatus(c *gin.Context) {
	hostID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	applicantUserID, err := parseIDParam(c, "userId")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	var input service.UpdateApplicantStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.activityService.UpdateApplicantStatus(activityID, hostID, applicantUserID, input.Status); err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, "status updated")
}

// --- Activity Comments ---

// GetActivityComments godoc
// @Summary      Get comments for an activity
// @Tags         activities
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/comments [get]
func (h *ActivityHandler) GetActivityComments(c *gin.Context) {
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	comments, err := h.commentService.GetByActivityID(activityID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, comments)
}

// PostActivityComment godoc
// @Summary      Post a comment on an activity
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Activity ID"
// @Param        input body service.CreateCommentInput true "Comment Data"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/comments [post]
func (h *ActivityHandler) PostActivityComment(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input service.CreateCommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	comment, err := h.commentService.CreateForActivity(activityID, userID, input.Content)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, comment)
}

// --- Rating ---

// ListParticipants godoc
// @Summary      List confirmed participants
// @Tags         activities
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/participants [get]
func (h *ActivityHandler) ListParticipants(c *gin.Context) {
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	participants, err := h.activityService.ListParticipants(activityID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, participants)
}

// SubmitRating godoc
// @Summary      Rate a participant
// @Tags         activities
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Activity ID"
// @Param        input body service.SubmitRatingInput true "Rating Data"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /activities/{id}/rate [post]
func (h *ActivityHandler) SubmitRating(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	var input service.SubmitRatingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.ratingService.SubmitRating(activityID, userID, input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "rating submitted")
}

// GetActivityRatings godoc
// @Summary      Get ratings for an activity
// @Tags         activities
// @Security     BearerAuth
// @Param        id path int true "Activity ID"
// @Success      200  {object}  response.Response
// @Router       /activities/{id}/ratings [get]
func (h *ActivityHandler) GetActivityRatings(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	activityID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid activity ID")
		return
	}

	ratings, err := h.ratingService.GetActivityRatings(activityID, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, ratings)
}
