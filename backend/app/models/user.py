from datetime import datetime
from . import db

class Users(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    email = db.Column(db.Text, unique=True, nullable=False)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # function to change user input to a dictionary
    # This is useful for converting the model to JSON format
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }