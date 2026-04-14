#!/bin/bash

# Source environment variables
if [ -f ".env.local" ]; then
  ENV_FILE=".env.local"
elif [ -f "env.local" ]; then
  ENV_FILE="env.local"
else
  echo "env.local or .env.local not found!"
  exit 1
fi

# Read file line by line to avoid issues with quotes
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  case "$key" in
    \#* | "") continue ;;
  esac
  # Remove quotes if present
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  export "$key=$value"
done < "$ENV_FILE"

if [ -z "$PROJECT_ID" ]; then
  echo "PROJECT_ID is not set in $ENV_FILE!"
  exit 1
fi

IMAGE_NAME="do-time"
SERVICE_NAME="do-time"
REGION="us-central1"

if [ -n "$GCP_REGION" ]; then
  REGION=$GCP_REGION
fi

echo "Building Docker image on Cloud Build..."
# Navigate to web folder where Dockerfile is located
cd web || { echo "web directory not found!"; exit 1; }

gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME --project $PROJECT_ID

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "Done!"
