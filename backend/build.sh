#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Navigate to frontend directory and install dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Copy built frontend to backend static directory
echo "📁 Copying frontend build to backend..."
mkdir -p ../backend/app/static
cp -r dist/* ../backend/app/static/

echo "✅ Build completed successfully!" 