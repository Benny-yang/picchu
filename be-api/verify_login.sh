#!/bin/bash

# 1. Register User (user2)
echo "Registering user2..."
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "email": "user3@example.com"
  }'
echo -e "\n"

# 2. Login User (Success)
echo "Logging in user2 (Correct Password)..."
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user3@example.com",
    "password": "password123"
  }'
echo -e "\n"

# 3. Login User (Failure)
echo "Logging in user2 (Wrong Password)..."
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user3@example.com",
    "password": "wrongpassword"
  }'
echo -e "\n"

echo "Registering duplicate user3 (Should Fail)..."
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "email": "user3@example.com"
  }'
echo -e "\n"

echo "Logging in non-existent user (Should Fail: 此帳號不存在)..."
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nobody@example.com",
    "password": "password123"
  }'
echo -e "\n"
