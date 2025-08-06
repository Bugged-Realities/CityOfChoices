#!/usr/bin/env python3
"""
Database initialization script for Render deployment.
This script ensures the database is properly set up with all tables and columns.
"""

import os
import sys
from flask import Flask
from flask_migrate import upgrade

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def init_database():
    """Initialize the database with all migrations."""
    app = create_app()
    
    with app.app_context():
        print("🗄️ Running database migrations...")
        try:
            upgrade()
            print("✅ Database migrations completed successfully!")
        except Exception as e:
            print(f"❌ Error running migrations: {e}")
            sys.exit(1)

if __name__ == "__main__":
    init_database() 