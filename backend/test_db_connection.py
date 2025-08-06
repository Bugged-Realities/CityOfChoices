#!/usr/bin/env python3
"""
Simple database connection test.
"""

import os
import sys
from sqlalchemy import text

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db

def test_db_connection():
    """Test basic database connectivity."""
    app = create_app()
    
    with app.app_context():
        print("🔍 Testing database connection...")
        
        try:
            # Test basic connection
            result = db.engine.execute(text("SELECT 1 as test"))
            print("✅ Database connection successful")
            
            # Test database URL
            db_url = db.engine.url
            print(f"📊 Database URL: {db_url}")
            
            # Test if we can query the database
            result = db.engine.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f"📊 Connected to database: {db_name}")
            
            # Test if tables exist
            result = db.engine.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Available tables: {tables}")
            
            print("✅ All database tests passed!")
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_db_connection() 