from flask_migrate import Migrate, upgrade, init, migrate
from app import create_app, db

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        # Initialize migrations if not already done
        try:
            init()
        except:
            pass  # Already initialized
        
        # Create migration
        migrate(message='New migration')
        
        # Apply migrations
        upgrade() 