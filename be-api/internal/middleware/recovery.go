package middleware

import (
	"azure-magnetar/pkg/apperror"
	"azure-magnetar/pkg/logger"
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
				var stack []byte
				stack = debug.Stack()

				// Log the panic with stack trace
				logger.Error("Panic recovered", "error", fmt.Sprintf("%v", err), "stack", string(stack))

				// Convert panic to standard API error
				apiErr := apperror.New(apperror.CodeInternal, "Internal Server Error")

				// Abort with JSON response
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code":    apiErr.Code,
					"message": apiErr.Message,
				})
			}
		}()
		c.Next()
	}
}
