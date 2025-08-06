#!/usr/bin/env python3
"""
Database structure checker for debugging.
"""

import os
import sys
from sqlalchemy import inspect, text

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db

def check_database():
    """Check the current database structure."""
    app = create_app()
    
    with app.app_context():
        print("🔍 Checking database structure...")
        
        try:
            # Get database inspector
            inspector = inspect(db.engine)
            
            # Get all table names
            tables = inspector.get_table_names()
            print(f"📋 Tables in database: {tables}")
            
            # Check each table's columns
            for table_name in tables:
                print(f"\n📊 Table: {table_name}")
                columns = inspector.get_columns(table_name)
                for column in columns:
                    print(f"  - {column['name']}: {column['type']} (nullable: {column['nullable']})")
                
                # Check foreign keys
                foreign_keys = inspector.get_foreign_keys(table_name)
                if foreign_keys:
                    print(f"  🔗 Foreign keys:")
                    for fk in foreign_keys:
                        print(f"    - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
            
            # Check if we can query the models
            print(f"\n🧪 Testing model queries...")
            try:
                from app.models import Users, Character, GameState, Scene, Inventory
                
                user_count = Users.query.count()
                print(f"  - Users count: {user_count}")
                
                character_count = Character.query.count()
                print(f"  - Characters count: {character_count}")
                
                game_state_count = GameState.query.count()
                print(f"  - Game states count: {game_state_count}")
                
                scene_count = Scene.query.count()
                print(f"  - Scenes count: {scene_count}")
                
                inventory_count = Inventory.query.count()
                print(f"  - Inventory count: {inventory_count}")
                
            except Exception as e:
                print(f"  ❌ Error querying models: {e}")
                
        except Exception as e:
            print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    check_database() 