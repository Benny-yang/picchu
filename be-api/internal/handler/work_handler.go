package handler

import (
	"net/http"
	"strconv"
	"time"

	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// WorkHandler handles work/portfolio HTTP requests.
type WorkHandler struct {
	workService    service.WorkService
	likeService    service.LikeService
	commentService service.CommentService
	ratingService  service.RatingService
}

// NewWorkHandler creates a new WorkHandler.
func NewWorkHandler(
	workService service.WorkService,
	likeService service.LikeService,
	commentService service.CommentService,
	ratingService service.RatingService,
) *WorkHandler {
	return &WorkHandler{
		workService:    workService,
		likeService:    likeService,
		commentService: commentService,
		ratingService:  ratingService,
	}
}

// --- Wall ---

// GetWall godoc
// @Summary      Get works wall
// @Description  Get posts for trending or following wall with random seed cursor pagination
// @Tags         works
// @Produce      json
// @Param        type   query string false "Filter type: trending or following"
// @Param        seed   query int    false "Random seed for repeatable paging"
// @Param        cursor query string false "Pagination cursor"
// @Param        limit  query int    false "Limit per page (default 20)"
// @Success      200  {object}  service.WallResponse
// @Router       /works [get]
func (h *WorkHandler) GetWall(c *gin.Context) {
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
		seed = time.Now().UnixNano()
	}

	var currentUserID uint
	if v, exists := c.Get("userID"); exists {
		if id, ok := v.(uint); ok {
			currentUserID = id
		}
	}

	if filterType == "following" && currentUserID == 0 {
		response.Error(c, http.StatusUnauthorized, "authentication required for following feed")
		return
	}

	resp, err := h.workService.GetWall(filterType, seed, cursor, limit, currentUserID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, resp)
}

// --- CRUD ---

// CreateWork godoc
// @Summary      Upload a new work
// @Tags         works
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        input body service.CreateWorkInput true "Work Data"
// @Success      200  {object}  response.Response
// @Router       /works [post]
func (h *WorkHandler) CreateWork(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var input service.CreateWorkInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	work, err := h.workService.Create(userID, input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, work)
}

// GetWork godoc
// @Summary      Get work details
// @Tags         works
// @Param        id path int true "Work ID"
// @Success      200  {object}  response.Response
// @Router       /works/{id} [get]
func (h *WorkHandler) GetWork(c *gin.Context) {
	id, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	work, err := h.workService.GetByID(id, userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "work not found")
		return
	}

	// Populate author rating
	if work.Author.ID != 0 {
		rating, err := h.ratingService.GetAverageByUserID(work.Author.ID)
		if err == nil {
			work.Author.AverageRating = rating
		}
	}

	response.Success(c, work)
}

// UpdateWork godoc
// @Summary      Update work description
// @Tags         works
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Work ID"
// @Param        input body service.UpdateWorkInput true "Work Data"
// @Success      200  {object}  response.Response
// @Router       /works/{id} [put]
func (h *WorkHandler) UpdateWork(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	var input service.UpdateWorkInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	work, err := h.workService.Update(userID, workID, input)
	if err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, work)
}

// DeleteWork godoc
// @Summary      Delete a work
// @Tags         works
// @Security     BearerAuth
// @Param        id path int true "Work ID"
// @Success      200  {object}  response.Response
// @Router       /works/{id} [delete]
func (h *WorkHandler) DeleteWork(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	if err := h.workService.Delete(userID, workID); err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, "work deleted")
}

// --- Like ---

// LikeWork godoc
// @Summary      Like a work
// @Tags         works
// @Security     BearerAuth
// @Param        id path int true "Work ID"
// @Success      200  {object}  response.Response
// @Router       /works/{id}/like [post]
func (h *WorkHandler) LikeWork(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	if err := h.likeService.LikeWork(userID, workID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "liked")
}

// UnlikeWork godoc
// @Summary      Unlike a work
// @Tags         works
// @Security     BearerAuth
// @Param        id path int true "Work ID"
// @Success      200  {object}  response.Response
// @Router       /works/{id}/like [delete]
func (h *WorkHandler) UnlikeWork(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	if err := h.likeService.UnlikeWork(userID, workID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "unliked")
}

// --- Comments ---

// GetWorkComments godoc
// @Summary      Get comments for a work
// @Tags         works
// @Param        id path int true "Work ID"
// @Success      200  {object}  response.Response
// @Router       /works/{id}/comments [get]
func (h *WorkHandler) GetWorkComments(c *gin.Context) {
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	comments, err := h.commentService.GetByWorkID(workID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, comments)
}

// PostWorkComment godoc
// @Summary      Post a comment on a work
// @Tags         works
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Work ID"
// @Param        input body service.CreateCommentInput true "Comment Data"
// @Success      200  {object}  response.Response
// @Router       /works/{id}/comments [post]
func (h *WorkHandler) PostWorkComment(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	workID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid work ID")
		return
	}

	var input service.CreateCommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	comment, err := h.commentService.CreateForWork(workID, userID, input.Content)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, comment)
}
