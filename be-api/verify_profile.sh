#!/bin/bash

echo "Cleaning up..."
rm -f uploads/avatars/*.jpg

echo "Registering user_profile_test..."
curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profile_test@example.com",
    "password": "password123"
  }' > /dev/null

echo "Login user_profile_test..."
LOGIN_RES=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profile_test@example.com",
    "password": "password123"
  }')

# Extract ID using grep/sed as we don't have jq
USER_ID=$(echo $LOGIN_RES | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "User ID: $USER_ID"

echo -e "\n1. Update Profile (Success)..."
curl -s -X PUT http://localhost:8080/api/v1/users/$USER_ID/profile \
  -H "Content-Type: application/json" \
  -d '{
    "username": "SuperStar",
    "nickname": "Star",
    "city": "Taipei City",
    "gender": "female",
    "isModel": true,
    "bio": "I am a star"
  }'
echo -e "\n"

echo -e "\n2. Update Profile with Avatar (Success)..."
# Small red dot base64
BASE64_IMG="iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
curl -s -X PUT http://localhost:8080/api/v1/users/$USER_ID/profile \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "StarWithImage",
    "gender": "female",
    "isModel": true,
    "avatarBase64": "'$BASE64_IMG'"
  }'
echo -e "\n"

echo -e "\n3. Missing Gender (Failure)..."
curl -s -X PUT http://localhost:8080/api/v1/users/$USER_ID/profile \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "NoGender",
    "isModel": true
  }'
echo -e "\n"

echo -e "\n4. No Role (Failure)..."
curl -s -X PUT http://localhost:8080/api/v1/users/$USER_ID/profile \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "NoRole",
    "gender": "male"
  }'
echo -e "\n"

echo -e "\nChecking Avatar File..."
ls -l uploads/avatars/
