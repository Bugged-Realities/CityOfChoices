#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process..."

# 1. Install Dependencies
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

# Navigate back to backend directory
cd ../backend

# 2. Run Database Migrations
echo "🗄️ Running database migrations..."
export FLASK_APP=run.py
export FLASK_ENV=production
export PYTHONPATH=$(pwd)
flask db upgrade



# 8. Seed the database
echo "🌱 Seeding database with story data..."
python seed_scenes.py

echo "✅ Build completed successfully!" 