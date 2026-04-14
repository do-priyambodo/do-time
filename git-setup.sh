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

if [ -z "$YOUR_GITHUB_TOKEN" ]; then
  echo "YOUR_GITHUB_TOKEN is not set in $ENV_FILE!"
  exit 1
fi

ORG_NAME="do-priyambodo"
REPO_NAME="do-time"

echo "Creating repository $ORG_NAME/$REPO_NAME on GitHub..."

# Create repo via API
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Authorization: token $YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/$ORG_NAME/repos \
  -d "{\"name\":\"$REPO_NAME\", \"private\": false}")

if [ "$RESPONSE" -eq 201 ]; then
  echo "Repository created successfully!"
elif [ "$RESPONSE" -eq 422 ]; then
  echo "Repository already exists (or name taken)."
else
  echo "Failed to create repository. HTTP Status: $RESPONSE"
  echo "Please check your token permissions or if the organization exists."
fi

echo "Initializing git and pushing..."

# Check if inside do-time root (should have 'web' directory)
if [ ! -d "web" ]; then
  echo "Error: Not in do-time root directory (missing 'web' folder)!"
  exit 1
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Add remote with token for authentication
git remote remove origin 2>/dev/null
git remote add origin https://$YOUR_GITHUB_TOKEN@github.com/$ORG_NAME/$REPO_NAME.git

git add .
git commit -m "Initial commit for do-time"

git push -u origin main

echo "Done!"
