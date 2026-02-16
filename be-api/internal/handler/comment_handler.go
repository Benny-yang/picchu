package handler

import (
	"net/http"

	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// CommentHandler handles comment deletion.
type CommentHandler struct {
	commentService service.CommentService
}

// NewCommentHandler creates a new CommentHandler.
func NewCommentHandler(commentService service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

// DeleteComment godoc
// @Summary      Delete a comment
// @Description  Delete a comment (author only)
// @Tags         comments
// @Security     BearerAuth
// @Param        id path int true "Comment ID"
// @Success      200  {object}  response.Response
// @Failure      403  {object}  response.Response
// @Router       /comments/{id} [delete]
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	commentID, err := parseIDParam(c, "id")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid comment ID")
		return
	}

	if err := h.commentService.Delete(commentID, userID); err != nil {
		response.Error(c, http.StatusForbidden, err.Error())
		return
	}

	response.Success(c, "comment deleted")
}
