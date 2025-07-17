from flask import Flask
from app import db
from app.models import user, character, game_state, inventory_item, scene
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

migrate = Migrate()  # <-- move to global scope
jwt = JWTManager()  

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    migrate.init_app(app, db)  # <-- use init_app
    jwt.init_app(app)  # <-- initialize JWT manager

    # Register blueprints here when ready
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
