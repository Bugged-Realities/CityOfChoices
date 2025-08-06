#!/usr/bin/env python3
"""
Test script to debug registration issues.
"""

import os
import sys
from sqlalchemy import inspect, text

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, Users, Character, GameState

def test_registration():
    """Test the registration process step by step."""
    app = create_app()
    
    with app.app_context():
        print("🔍 Testing registration process...")
        
        try:
            # Check database connection
            print("1. Testing database connection...")
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            # Check table structure
            print("\n2. Checking table structure...")
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📋 Tables: {tables}")
            
            for table_name in tables:
                print(f"\n📊 Table: {table_name}")
                columns = inspector.get_columns(table_name)
                for column in columns:
                    print(f"  - {column['name']}: {column['type']}")
            
            # Test creating a user
            print("\n3. Testing user creation...")
            test_email = "test@example.com"
            test_username = "testuser"
            test_password = "TestPass123"
            
            # Check if test user exists
            existing_user = Users.query.filter_by(email=test_email).first()
            if existing_user:
                print("⚠️ Test user already exists, deleting...")
                db.session.delete(existing_user)
                db.session.commit()
            
            # Test password hashing
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt()
            hashed_password = bcrypt.generate_password_hash(test_password).decode('utf-8')
            print("✅ Password hashing successful")
            
            # Test user creation
            new_user = Users(
                email=test_email,
                username=test_username,
                password_hash=hashed_password
            )
            db.session.add(new_user)
            db.session.flush()
            print(f"✅ User created with ID: {new_user.id}")
            
            # Test character creation
            print("\n4. Testing character creation...")
            default_character = Character(
                user_id=new_user.id,
                name=test_username,
                fear=0,
                sanity=100
            )
            db.session.add(default_character)
            db.session.flush()
            print(f"✅ Character created with ID: {default_character.id}")
            
            # Test game state creation
            print("\n5. Testing game state creation...")
            initial_game_state = GameState(
                character_id=default_character.id,
                stage_id='start',
                game_data={
                    'current_stage': 'start',
                    'choice_history': [],
                    'current_stats': {'fear': 0, 'sanity': 100},
                    'inventory_snapshot': []
                }
            )
            db.session.add(initial_game_state)
            db.session.commit()
            print("✅ Game state created successfully")
            
            # Clean up test data
            print("\n6. Cleaning up test data...")
            db.session.delete(initial_game_state)
            db.session.delete(default_character)
            db.session.delete(new_user)
            db.session.commit()
            print("✅ Test data cleaned up")
            
            print("\n🎉 All registration tests passed!")
            
        except Exception as e:
            print(f"❌ Registration test failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_registration() 