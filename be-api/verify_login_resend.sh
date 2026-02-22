#!/bin/bash
BASE_URL="http://localhost:8080/api/v1"
EMAIL="login_resend_test_1771344749@example.com"
PASSWORD="password123"

# 1. Register a new user
echo "1. Registering $EMAIL..."
curl -s -X POST "$BASE_URL/auth/register"   -H "Content-Type: application/json"   -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}' > /dev/null

# 2. Attempt Login (Should fail with specific message)
echo "2. Attempting Login (Expect failure)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login"   -H "Content-Type: application/json"   -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}')

echo "Login Response: $LOGIN_RESPONSE"

if [[ "$LOGIN_RESPONSE" == *"請先驗證您的信箱"* ]]; then
  echo "✅ Verified: Login failed with expected error message."
else
  echo "❌ Failed: Unexpected login response."
  exit 1
fi

# 3. Resend Verification
echo "3. Resending verification email..."
RESEND_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/resend-verification"   -H "Content-Type: application/json"   -d '{"email":"'$EMAIL'"}')

echo "Resend Response: $RESEND_RESPONSE"
