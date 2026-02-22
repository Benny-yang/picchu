package handler

import (
	"net/http"

	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/response"

	"github.com/gin-gonic/gin"
)

// HandleServiceError inspects the error type and responds with the appropriate
// HTTP status code. If the error is an AppError, its Code determines the status.
// Otherwise, a generic 500 Internal Server Error is returned.
func HandleServiceError(c *gin.Context, err error) {
	if appErr, ok := apperror.AsAppError(err); ok {
		response.Error(c, appErr.HTTPStatus(), appErr.Message)
		return
	}
	response.Error(c, http.StatusInternalServerError, "internal server error")
}
