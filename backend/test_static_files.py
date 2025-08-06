#!/usr/bin/env python3
"""
Test script to verify static file serving and catch-all route.
"""

import os
import sys

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def test_static_files():
    """Test if static files are accessible."""
    app = create_app()
    
    with app.test_client() as client:
        print("🔍 Testing static file serving...")
        
        # Check if static folder exists
        static_folder = app.static_folder
        print(f"📁 Static folder: {static_folder}")
        print(f"📁 Static folder exists: {os.path.exists(static_folder)}")
        
        if os.path.exists(static_folder):
            files = os.listdir(static_folder)
            print(f"📋 Files in static folder: {files}")
        
        # Test serving index.html
        print("\n1. Testing index.html serving...")
        response = client.get('/')
        print(f"Root path status: {response.status_code}")
        
        # Test serving a non-existent API route
        print("\n2. Testing non-existent API route...")
        response = client.get('/api/nonexistent')
        print(f"Non-existent API status: {response.status_code}")
        print(f"Response: {response.get_data(as_text=True)}")
        
        # Test serving a frontend route
        print("\n3. Testing frontend route...")
        response = client.get('/login')
        print(f"Frontend route status: {response.status_code}")
        
        # Test serving a nested frontend route
        print("\n4. Testing nested frontend route...")
        response = client.get('/game/some-nested-route')
        print(f"Nested frontend route status: {response.status_code}")
        
        # Test if index.html exists
        index_path = os.path.join(static_folder, 'index.html')
        print(f"\n📄 Index.html exists: {os.path.exists(index_path)}")
        
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                content = f.read()
                print(f"📄 Index.html size: {len(content)} characters")
                if 'React' in content or 'root' in content:
                    print("✅ Index.html appears to be a React app")
                else:
                    print("⚠️ Index.html doesn't look like a React app")

if __name__ == "__main__":
    test_static_files() 