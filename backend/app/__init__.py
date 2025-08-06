from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
import os
import logging
from .config import Config
from .models import db
from .utils.error_handling import (
    handle_game_exception,
    handle_generic_exception,
    handle_http_exception,
    GameException
)

# Initialize extensions
jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config.from_object(Config)
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize extensions with app
    # Allow all origins for production deployment
    CORS(app, origins=['*'], supports_credentials=True)
    jwt.init_app(app)
    bcrypt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # JWT identity functions
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return str(user)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        from .models import Users
        return Users.query.filter_by(id=int(identity)).one_or_none()
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has expired"}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token"}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Missing token"}, 401
    
    # Import and register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.character_routes import character_bp
    from .routes.game_routes import game_bp
    from .routes.inventory_routes import inventory_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(character_bp, url_prefix='/api/characters')
    app.register_blueprint(game_bp, url_prefix='/api/game')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    
    # Serve React frontend - improved catch-all route
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # Log the request for debugging
        app.logger.info(f"Serving path: {path}")
        
        # Handle API routes
        if path.startswith('api/'):
            app.logger.warning(f"API route not found: {path}")
            return jsonify({'error': 'API endpoint not found'}), 404
        
        # Check if the file exists in static folder
        static_file_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            app.logger.info(f"Serving static file: {path}")
            return send_from_directory(app.static_folder, path)
        
        # For all other routes, serve index.html (SPA routing)
        app.logger.info(f"Serving index.html for path: {path}")
        try:
            return send_from_directory(app.static_folder, 'index.html')
        except Exception as e:
            app.logger.error(f"Error serving index.html: {e}")
            return jsonify({'error': 'Frontend not found'}), 404
    
    # Register error handlers with better logging
    @app.errorhandler(GameException)
    def handle_game_exception_handler(error):
        app.logger.error(f"GameException: {error.message}")
        return handle_game_exception(error)
    
    @app.errorhandler(Exception)
    def handle_generic_exception_handler(error):
        app.logger.error(f"Unexpected error: {str(error)}", exc_info=True)
        return handle_generic_exception(error)
    
    @app.errorhandler(404)
    def handle_not_found(error):
        app.logger.warning(f"404 error: {error}")
        return handle_http_exception(error)
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        app.logger.error(f"500 error: {error}", exc_info=True)
        return handle_generic_exception(error)
    
    return app