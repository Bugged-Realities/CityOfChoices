#!/usr/bin/env python3
"""
Test script to check API endpoints.
"""

import os
import sys
import requests
import json

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def test_api_endpoints():
    """Test if API endpoints are accessible."""
    app = create_app()
    
    with app.test_client() as client:
        print("🔍 Testing API endpoints...")
        
        # Test registration endpoint
        print("\n1. Testing registration endpoint...")
        registration_data = {
            "username": "testapi",
            "email": "testapi@example.com",
            "password": "TestPass123"
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(registration_data),
                             content_type='application/json')
        
        print(f"Registration status: {response.status_code}")
        print(f"Registration response: {response.get_data(as_text=True)}")
        
        if response.status_code == 201:
            print("✅ Registration endpoint working")
            
            # Test login endpoint
            print("\n2. Testing login endpoint...")
            login_data = {
                "username": "testapi",
                "password": "TestPass123"
            }
            
            response = client.post('/api/auth/login',
                                 data=json.dumps(login_data),
                                 content_type='application/json')
            
            print(f"Login status: {response.status_code}")
            print(f"Login response: {response.get_data(as_text=True)}")
            
            if response.status_code == 200:
                print("✅ Login endpoint working")
                
                # Get the token from response
                response_data = json.loads(response.get_data(as_text=True))
                token = response_data.get('access_token')
                
                if token:
                    print(f"✅ JWT token received: {token[:20]}...")
                    
                    # Test protected endpoint
                    print("\n3. Testing protected endpoint...")
                    headers = {'Authorization': f'Bearer {token}'}
                    
                    response = client.get('/api/characters/get', headers=headers)
                    
                    print(f"Protected endpoint status: {response.status_code}")
                    print(f"Protected endpoint response: {response.get_data(as_text=True)}")
                    
                    if response.status_code == 200:
                        print("✅ Protected endpoint working")
                    else:
                        print("❌ Protected endpoint failed")
                else:
                    print("❌ No JWT token in response")
            else:
                print("❌ Login endpoint failed")
        else:
            print("❌ Registration endpoint failed")
        
        # Test CORS headers
        print("\n4. Testing CORS headers...")
        response = client.options('/api/auth/register')
        print(f"CORS preflight status: {response.status_code}")
        print(f"CORS headers: {dict(response.headers)}")

if __name__ == "__main__":
    test_api_endpoints() 