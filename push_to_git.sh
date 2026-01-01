#!/bin/bash

# Define repository URL
REPO_URL="https://github.com/callme-ADHI/Arise_2.0"

echo "Initializing git push to $REPO_URL"

# Check if .git exists, if not initialize
if [ ! -d ".git" ]; then
    echo "Initializing new git repository..."
    git init
    git branch -M main
fi

# Configure remote
if git remote | grep -q "^origin$"; then
    echo "Updating existing remote 'origin'..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote 'origin'..."
    git remote add origin "$REPO_URL"
fi

# Add all files
echo "Staging files..."
git add .

# Commit
echo "Committing..."
git commit -m "Update all files"

# Push
echo "Pushing to remote..."
git push -u origin main

echo "Done!"
