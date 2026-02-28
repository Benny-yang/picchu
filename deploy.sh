#!/bin/bash

# VibeCoding GCP Deployment Script
# Usage: ./deploy.sh

set -e # Exit immediately if a command exits with a non-zero status.

# Configuration
PROJECT_ID="project-df010f57-c295-4f3c-ba4"
REGION="asia-east1"
REPO_NAME="vibe-coding-repo"
SQL_INSTANCE_NAME="vibe-coding-db"
ENVIRONMENT="${ENVIRONMENT:-test}"

if [ "$ENVIRONMENT" = "production" ]; then
    DB_NAME="vibe_coding"
    SERVICE_SUFFIX=""
    GCS_BUCKET_NAME="${PROJECT_ID}-prod-uploads"
else
    DB_NAME="vibe_coding_test"
    SERVICE_SUFFIX="-test"
    GCS_BUCKET_NAME="${PROJECT_ID}-uploads"
fi

DB_USER="root"
BE_SERVICE_NAME="be-api${SERVICE_SUFFIX}"
FE_SERVICE_NAME="fe-web${SERVICE_SUFFIX}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment for Project: ${PROJECT_ID}${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud SDK is not installed.${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting GCloud Project...${NC}"
gcloud config set project $PROJECT_ID

# 1. Enable Services
echo -e "${YELLOW}Enabling required services...${NC}"
gcloud services enable \
    artifactregistry.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    cloudbuild.googleapis.com \
    storage-api.googleapis.com \
    storage-component.googleapis.com

# 2. Create Artifact Registry
echo -e "${YELLOW}Checking/Creating Artifact Registry...${NC}"
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &> /dev/null; then
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="VibeCoding Docker Repository"
    echo -e "${GREEN}Artifact Registry created.${NC}"
else
    echo -e "${GREEN}Artifact Registry already exists.${NC}"
fi

# 3. Cloud SQL Setup
echo -e "${YELLOW}Checking/Creating Cloud SQL Instance (This may take a while)...${NC}"
# Use environment variable DB_PASSWORD if set, otherwise generate one
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 12)
    echo -e "${YELLOW}Generated DB_PASSWORD: $DB_PASSWORD (Please save this!)${NC}"
fi

if ! gcloud sql instances describe $SQL_INSTANCE_NAME &> /dev/null; then
    gcloud sql instances create $SQL_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --cpu=1 \
        --memory=3840MiB \
        --region=$REGION \
        --root-password=$DB_PASSWORD
    echo -e "${GREEN}Cloud SQL Instance created.${NC}"
else
    echo -e "${GREEN}Cloud SQL Instance already exists.${NC}"
    # Optionally reset root password here if needed: gcloud sql users set-password root --host=% --instance=$SQL_INSTANCE_NAME --password=$DB_PASSWORD
fi

# Grant Cloud SQL Client role to default service account
echo -e "${YELLOW}Granting Cloud SQL Client role...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
    --role=roles/cloudsql.client

# Create Database if not exists
echo -e "${YELLOW}Checking/Creating Database...${NC}"
if ! gcloud sql databases describe $DB_NAME --instance=$SQL_INSTANCE_NAME &> /dev/null; then
    gcloud sql databases create $DB_NAME --instance=$SQL_INSTANCE_NAME
    echo -e "${GREEN}Database created.${NC}"
else
     echo -e "${GREEN}Database already exists.${NC}"
fi

# 3.5 GCS Bucket Setup
echo -e "${YELLOW}Checking/Creating GCS Bucket for Uploads...${NC}"
if ! gcloud storage buckets describe gs://$GCS_BUCKET_NAME &> /dev/null; then
    gcloud storage buckets create gs://$GCS_BUCKET_NAME --location=$REGION --uniform-bucket-level-access
    gcloud storage buckets update gs://$GCS_BUCKET_NAME --web-main-page-suffix=index.html
    echo -e "${GREEN}GCS Bucket $GCS_BUCKET_NAME created.${NC}"
else
    echo -e "${GREEN}GCS Bucket $GCS_BUCKET_NAME already exists.${NC}"
fi

# Make bucket public
echo -e "${YELLOW}Making GCS Bucket public...${NC}"
gcloud storage buckets add-iam-policy-binding gs://$GCS_BUCKET_NAME \
    --member=allUsers \
    --role=roles/storage.objectViewer

# 4. Deploy Backend
echo -e "${YELLOW}Building and Deploying Backend API...${NC}"
gcloud builds submit ./be-api \
    --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/${BE_SERVICE_NAME}:latest

echo -e "${YELLOW}Deploying Backend to Cloud Run...${NC}"
gcloud run deploy ${BE_SERVICE_NAME} \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/${BE_SERVICE_NAME}:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "DSN=$DB_USER:$DB_PASSWORD@unix(/cloudsql/$PROJECT_ID:$REGION:$SQL_INSTANCE_NAME)/$DB_NAME?charset=utf8mb4&parseTime=True&loc=UTC,GCS_BUCKET_NAME=$GCS_BUCKET_NAME" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$SQL_INSTANCE_NAME

# Get Backend URL
BACKEND_URL=$(gcloud run services describe ${BE_SERVICE_NAME} --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Backend deployed at: $BACKEND_URL${NC}"

# 5. Deploy Frontend
echo -e "${YELLOW}Building and Deploying Frontend Web App...${NC}"
echo "VITE_API_URL=$BACKEND_URL/api/v1" > ./fe-web/.env.production
echo "VITE_IMG_BASE_URL=$BACKEND_URL" >> ./fe-web/.env.production

gcloud builds submit ./fe-web \
    --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/${FE_SERVICE_NAME}:latest

echo -e "${YELLOW}Deploying Frontend to Cloud Run...${NC}"
gcloud run deploy ${FE_SERVICE_NAME} \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/${FE_SERVICE_NAME}:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

FRONTEND_URL=$(gcloud run services describe ${FE_SERVICE_NAME} --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Frontend deployed at: $FRONTEND_URL${NC}"

echo -e "${YELLOW}Updating Backend with Full Environment Variables...${NC}"
gcloud run services update ${BE_SERVICE_NAME} \
    --region $REGION \
    --update-env-vars="API_BASE_URL=$BACKEND_URL,FRONTEND_URL=$FRONTEND_URL,RESEND_API_KEY=re_KETvX7en_BD7YaQXGFYrRpRL7VmMbZJWQ"

echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "Backend: $BACKEND_URL"
echo -e "Frontend: $FRONTEND_URL"
