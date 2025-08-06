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

# 3. Test database connection
echo "🔍 Testing database connection..."
python test_db_connection.py

# 4. Test registration process
echo "🧪 Testing registration process..."
python test_registration.py

# 5. Test login process
echo "🔐 Testing login process..."
python test_login.py

# 6. Test API endpoints
echo "🌐 Testing API endpoints..."
python test_api_endpoints.py

# 7. Test static file serving
echo "📁 Testing static file serving..."
python test_static_files.py

# 8. Seed the database
echo "🌱 Seeding database with story data..."
python seed_scenes.py

echo "✅ Build completed successfully!" 