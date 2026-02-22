#!/bin/bash

# Kill background processes on exit
trap "exit" INT TERM
trap "kill 0" EXIT

echo "Starting Local Development Environment..."

# Backend Setup
echo "Creating/Updating Backend Dependencies..."
cd be-api
go mod tidy
echo "Starting Backend Server..."
export RESEND_API_KEY="re_KETvX7en_BD7YaQXGFYrRpRL7VmMbZJWQ"
# Using user-provided credentials with existing DB name (azure_magnetar)
export DSN="root:aa14725766@tcp(127.0.0.1:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=UTC"
# CORS: Allow multiple local ports
export ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:5175"
# Password reset link base URL
export FRONTEND_URL="http://localhost:5173"
go run cmd/server/main.go &
BE_PID=$!

# Wait for backend to start (simple sleep)
sleep 5

# Frontend Setup
echo "Starting Frontend..."
cd ../fe-web
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend Dependencies..."
    npm install
fi

# Fixed: Added /api/v1 to the URL
export VITE_API_URL="http://localhost:8080/api/v1"
npm run dev

wait $BE_PID
