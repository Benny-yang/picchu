# Deploying to Google Cloud Platform (GCP)

This guide outlines the steps to deploy the VibeCoding application (Backend + Frontend) to Google Cloud Run, using Cloud SQL for the database.

## Prerequisites
- Google Cloud SDK installed and logged in (`gcloud auth login`).
- Project ID set: `project-df010f57-c295-4f3c-ba4`.
- Billing enabled for the project.

## Automated Deployment (Recommended)

We have created or updated the script `deploy.sh` that automates the entire process, including fixing common Cloud Run issues:

1.  Enables required Google Cloud APIs.
2.  Creates an Artifact Registry repository.
3.  Creates a Cloud SQL instance and database.
4.  **Grants `roles/cloudsql.client` to the default Cloud Run service account** (Critical for DB connection).
5.  Builds and deploys the Backend API:
    - Sets the `DSN` environment variable for Cloud SQL connection.
    - Uses `loc=UTC` to avoid timezone issues.
6.  Builds and deploys the Frontend Web App:
    - Configures Nginx to listen on port 8080 (Required by Cloud Run).
    - Injects the Backend URL into the frontend build.

### Usage

1.  Make the script executable:
    ```bash
    chmod +x deploy.sh
    ```

2.  Run the script:
    ```bash
    ./deploy.sh
    ```
    *You will be prompted to enter a database password.*

---

## Technical Details & Troubleshooting

If you need to debug or deploy manually, keep these critical configurations in mind:

### 1. Database Connection (DSN)
The Backend API requires a `DSN` environment variable in the following format for Cloud Run:
```bash
DSN="user:password@unix(/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME)/DB_NAME?charset=utf8mb4&parseTime=True&loc=UTC"
```
*Note: `loc=UTC` is safer than `Local` unless `tzdata` is installed in the container.*

### 2. IAM Permissions
The service account running the Cloud Run service (default is the Compute Engine default service account) **MUST** have the `roles/cloudsql.client` role.
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com \
    --role=roles/cloudsql.client
```

### 3. Frontend Port
Cloud Run sends requests to `PORT` (default 8080). Nginx must listen on this port.
- **nginx.conf**: `listen 8080;`
- **Dockerfile**: `EXPOSE 8080`

### 4. Dockerfile Dependencies
The Backend `Dockerfile` (Alpine based) requires `ca-certificates` and `tzdata`:
```dockerfile
RUN apk --no-cache add ca-certificates tzdata
```

### 5. Frontend Build Args
When using `gcloud builds submit`, passing `--build-arg` is not supported with `--tag`. Instead, modify the `.env` file locally before building, or use `cloudbuild.yaml`. The `deploy.sh` script handles this by updating `.env.production` before submission.
