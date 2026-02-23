package middleware

import (
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/logger"
	"azure-magnetar/pkg/response"
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// Recovery returns a middleware that recovers from any panics and writes a 500 JSON response if there was one.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Record stack trace
				stack := debug.Stack()

				// Log the panic with stack trace
				logger.Error("Panic recovered", "error", fmt.Sprintf("%v", err), "stack", string(stack))

				// BE-L2 fix: use response package for consistent error format
				response.Error(c, http.StatusInternalServerError, apperror.New(apperror.CodeInternal, "Internal Server Error").Message)
			}
		}()
		c.Next()
	}
}
