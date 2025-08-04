from flask import jsonify
from werkzeug.exceptions import HTTPException
import logging
import traceback
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GameException(Exception):
    """Base exception for game-related errors"""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class ValidationError(GameException):
    """Exception for validation errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 400, details)

class NotFoundError(GameException):
    """Exception for resource not found errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 404, details)

class AuthenticationError(GameException):
    """Exception for authentication errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 401, details)

class DatabaseError(GameException):
    """Exception for database errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 500, details)

def handle_game_exception(error: GameException):
    """Handle game-specific exceptions"""
    logger.error(f"GameException: {error.message}", extra={
        'status_code': error.status_code,
        'details': error.details,
        'traceback': traceback.format_exc()
    })
    
    response = {
        'error': error.message,
        'details': error.details
    }
    
    return jsonify(response), error.status_code

def handle_generic_exception(error: Exception):
    """Handle generic exceptions"""
    logger.error(f"Unexpected error: {str(error)}", extra={
        'traceback': traceback.format_exc()
    })
    
    response = {
        'error': 'An unexpected error occurred',
        'details': str(error) if isinstance(error, GameException) else 'Internal server error'
    }
    
    return jsonify(response), 500

def handle_http_exception(error: HTTPException):
    """Handle HTTP exceptions"""
    logger.warning(f"HTTPException: {error.description}", extra={
        'status_code': error.code,
        'traceback': traceback.format_exc()
    })
    
    response = {
        'error': error.description,
        'details': f'HTTP {error.code}'
    }
    
    return jsonify(response), error.code

def safe_database_operation(operation, error_message: str = "Database operation failed"):
    """Safely execute database operations with proper error handling"""
    try:
        return operation()
    except Exception as e:
        logger.error(f"Database error: {str(e)}", extra={
            'traceback': traceback.format_exc()
        })
        raise DatabaseError(error_message, {'original_error': str(e)})

def validate_required_fields(data: Dict[str, Any], required_fields: list, context: str = "request"):
    """Validate that required fields are present in request data"""
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            {'missing_fields': missing_fields, 'context': context}
        )

def validate_field_type(value: Any, expected_type: type, field_name: str):
    """Validate that a field is of the expected type"""
    if not isinstance(value, expected_type):
        raise ValidationError(
            f"Invalid type for {field_name}. Expected {expected_type.__name__}, got {type(value).__name__}",
            {'field': field_name, 'expected_type': expected_type.__name__, 'actual_type': type(value).__name__}
        )

def log_api_request(method: str, endpoint: str, user_id: Optional[int] = None, **kwargs):
    """Log API request for debugging"""
    logger.info(f"API Request: {method} {endpoint}", extra={
        'user_id': user_id,
        'method': method,
        'endpoint': endpoint,
        **kwargs
    })

def log_api_response(status_code: int, endpoint: str, user_id: Optional[int] = None, **kwargs):
    """Log API response for debugging"""
    logger.info(f"API Response: {status_code} for {endpoint}", extra={
        'user_id': user_id,
        'status_code': status_code,
        'endpoint': endpoint,
        **kwargs
    }) 