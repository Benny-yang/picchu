package apperror

import (
	"errors"
	"fmt"
	"net/http"
)

// ErrorCode classifies domain errors into categories that map to HTTP status codes.
type ErrorCode string

const (
	CodeNotFound     ErrorCode = "NOT_FOUND"
	CodeConflict     ErrorCode = "CONFLICT"
	CodeForbidden    ErrorCode = "FORBIDDEN"
	CodeValidation   ErrorCode = "VALIDATION"
	CodeUnauthorized ErrorCode = "UNAUTHORIZED"
	CodeInternal     ErrorCode = "INTERNAL"
)

// AppError represents a domain-level error with a classification code,
// a user-facing message, and an optional wrapped internal error.
type AppError struct {
	Code    ErrorCode
	Message string
	Err     error
}

// Error implements the error interface. Returns the user-facing message.
func (e *AppError) Error() string {
	return e.Message
}

// Unwrap supports errors.Is / errors.As chain.
func (e *AppError) Unwrap() error {
	return e.Err
}

// New creates a new AppError with the given code and user-facing message.
func New(code ErrorCode, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

// Wrap creates a new AppError that wraps an existing error, adding context.
func Wrap(code ErrorCode, message string, err error) *AppError {
	return &AppError{Code: code, Message: message, Err: err}
}

// Newf creates a new AppError with a formatted user-facing message.
func Newf(code ErrorCode, format string, args ...any) *AppError {
	return &AppError{Code: code, Message: fmt.Sprintf(format, args...)}
}

// HTTPStatus maps an ErrorCode to the corresponding HTTP status code.
func (e *AppError) HTTPStatus() int {
	switch e.Code {
	case CodeNotFound:
		return http.StatusNotFound
	case CodeConflict:
		return http.StatusConflict
	case CodeForbidden:
		return http.StatusForbidden
	case CodeValidation:
		return http.StatusBadRequest
	case CodeUnauthorized:
		return http.StatusUnauthorized
	default:
		return http.StatusInternalServerError
	}
}

// AsAppError extracts an *AppError from an error chain.
// Returns the AppError and true if found, nil and false otherwise.
func AsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}
