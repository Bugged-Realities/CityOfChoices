import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    
    # Production settings
    DEBUG = os.getenv("FLASK_ENV") != "production"
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    
    # Handle Render's DATABASE_URL format
    _database_url = os.getenv("DATABASE_URL")
    if _database_url and _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _database_url or "postgresql://localhost/capstone"
    