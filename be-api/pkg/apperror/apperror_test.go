package apperror

import (
	"errors"
	"net/http"
	"testing"
)

func TestNew(t *testing.T) {
	err := New(CodeNotFound, "user not found")

	if err.Code != CodeNotFound {
		t.Errorf("Code = %s, want NOT_FOUND", err.Code)
	}
	if err.Message != "user not found" {
		t.Errorf("Message = %s, want 'user not found'", err.Message)
	}
	if err.Error() != "user not found" {
		t.Errorf("Error() = %s, want 'user not found'", err.Error())
	}
}

func TestWrap(t *testing.T) {
	inner := errors.New("db connection failed")
	err := Wrap(CodeInternal, "failed to save user", inner)

	if err.Code != CodeInternal {
		t.Errorf("Code = %s, want INTERNAL", err.Code)
	}
	if !errors.Is(err, inner) {
		t.Error("Unwrap should return the inner error")
	}
}

func TestAsAppError(t *testing.T) {
	err := New(CodeConflict, "email already exists")
	appErr, ok := AsAppError(err)
	if !ok {
		t.Fatal("AsAppError should return true for AppError")
	}
	if appErr.Code != CodeConflict {
		t.Errorf("Code = %s, want CONFLICT", appErr.Code)
	}

	// Non-AppError
	_, ok = AsAppError(errors.New("plain error"))
	if ok {
		t.Fatal("AsAppError should return false for plain error")
	}
}

func TestHTTPStatus(t *testing.T) {
	tests := []struct {
		code   ErrorCode
		status int
	}{
		{CodeNotFound, http.StatusNotFound},
		{CodeConflict, http.StatusConflict},
		{CodeForbidden, http.StatusForbidden},
		{CodeValidation, http.StatusBadRequest},
		{CodeUnauthorized, http.StatusUnauthorized},
		{CodeInternal, http.StatusInternalServerError},
	}

	for _, tt := range tests {
		err := New(tt.code, "test")
		if err.HTTPStatus() != tt.status {
			t.Errorf("HTTPStatus(%s) = %d, want %d", tt.code, err.HTTPStatus(), tt.status)
		}
	}
}
