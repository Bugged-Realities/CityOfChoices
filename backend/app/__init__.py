from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from .config import Config
from .models import db

# Initialize extensions
jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions with app
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])
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
    
    # Import and register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.character_routes import character_bp
    from .routes.game_routes import game_bp
    from .routes.inventory_routes import inventory_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(character_bp, url_prefix='/api/characters')
    app.register_blueprint(game_bp, url_prefix='/api/game')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    
    return app