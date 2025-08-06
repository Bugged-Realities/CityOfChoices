#!/usr/bin/env python3
"""
Migration fix script for Render deployment.
This script ensures the database is in a clean state with all tables properly created.
"""

import os
import sys
from flask import Flask
from flask_migrate import upgrade, stamp
from sqlalchemy import text

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db

def fix_database():
    """Fix database migration issues and ensure all tables exist."""
    app = create_app()
    
    with app.app_context():
        print("🔧 Fixing database migration issues...")
        
        try:
            # Check if tables exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"📋 Existing tables: {existing_tables}")
            
            # If no tables exist, create them
            if not existing_tables:
                print("📝 No tables found. Creating all tables...")
                db.create_all()
                print("✅ All tables created successfully!")
                
                # Stamp the database with the latest migration
                stamp()
                print("✅ Database stamped with latest migration!")
            else:
                print("📝 Tables exist. Running migrations...")
                try:
                    # First try to stamp with the merge revision to resolve multiple heads
                    stamp(revision='ccf4576385e6')
                    print("✅ Database stamped with merge revision!")
                except Exception as e:
                    print(f"⚠️ Could not stamp with merge revision: {e}")
                
                # Then run upgrades
                upgrade()
                print("✅ Migrations completed successfully!")
                
        except Exception as e:
            print(f"❌ Error fixing database: {e}")
            # Try to create tables anyway
            try:
                print("🔄 Attempting to create tables directly...")
                db.create_all()
                print("✅ Tables created successfully!")
            except Exception as e2:
                print(f"❌ Failed to create tables: {e2}")
                sys.exit(1)

if __name__ == "__main__":
    fix_database() 