#!/usr/bin/env python3
"""
Test script to debug login issues.
"""

import os
import sys
from flask_bcrypt import Bcrypt

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, Users

def test_login():
    """Test the login process step by step."""
    app = create_app()
    
    with app.app_context():
        print("🔍 Testing login process...")
        
        try:
            # Test user credentials
            test_email = "testlogin@example.com"
            test_username = "testloginuser"
            test_password = "TestPass123"
            
            # Check if test user exists
            existing_user = Users.query.filter_by(email=test_email).first()
            if existing_user:
                print("⚠️ Test user already exists, deleting...")
                db.session.delete(existing_user)
                db.session.commit()
            
            # Create a test user
            print("1. Creating test user...")
            bcrypt = Bcrypt()
            hashed_password = bcrypt.generate_password_hash(test_password).decode('utf-8')
            
            new_user = Users(
                email=test_email,
                username=test_username,
                password_hash=hashed_password
            )
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ User created with ID: {new_user.id}")
            
            # Test login with username
            print("\n2. Testing login with username...")
            user_by_username = Users.query.filter_by(username=test_username).first()
            if user_by_username:
                print(f"✅ Found user by username: {user_by_username.username}")
                password_check = bcrypt.check_password_hash(user_by_username.password_hash, test_password)
                print(f"✅ Password check result: {password_check}")
            else:
                print("❌ User not found by username")
            
            # Test login with email
            print("\n3. Testing login with email...")
            user_by_email = Users.query.filter_by(email=test_email).first()
            if user_by_email:
                print(f"✅ Found user by email: {user_by_email.email}")
                password_check = bcrypt.check_password_hash(user_by_email.password_hash, test_password)
                print(f"✅ Password check result: {password_check}")
            else:
                print("❌ User not found by email")
            
            # Test the OR query used in login
            print("\n4. Testing OR query (username OR email)...")
            user_or = Users.query.filter((Users.username == test_username) | (Users.email == test_email)).first()
            if user_or:
                print(f"✅ Found user with OR query: {user_or.username}")
                password_check = bcrypt.check_password_hash(user_or.password_hash, test_password)
                print(f"✅ Password check result: {password_check}")
            else:
                print("❌ User not found with OR query")
            
            # Test with wrong password
            print("\n5. Testing with wrong password...")
            wrong_password_check = bcrypt.check_password_hash(user_or.password_hash, "WrongPassword")
            print(f"✅ Wrong password check result: {wrong_password_check} (should be False)")
            
            # Clean up
            print("\n6. Cleaning up test data...")
            db.session.delete(new_user)
            db.session.commit()
            print("✅ Test data cleaned up")
            
            print("\n🎉 All login tests passed!")
            
        except Exception as e:
            print(f"❌ Login test failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_login() 