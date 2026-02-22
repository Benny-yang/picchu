package logger

import (
	"log/slog"
	"os"
)

// appLogger is the package-level shared logger instance.
var appLogger *slog.Logger

func init() {
	appLogger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}

// Info logs an informational message with structured key-value pairs.
func Info(msg string, args ...any) {
	appLogger.Info(msg, args...)
}

// Warn logs a warning message with structured key-value pairs.
func Warn(msg string, args ...any) {
	appLogger.Warn(msg, args...)
}

// Error logs an error message with structured key-value pairs.
func Error(msg string, args ...any) {
	appLogger.Error(msg, args...)
}
