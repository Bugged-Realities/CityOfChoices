from datetime import datetime
from . import db

class Character(db.Model):
    __tablename__ = 'characters'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False)  # Changed from Text to String(255)
    fear = db.Column(db.Integer, default=0)
    sanity = db.Column(db.Integer, default=100)
    current_stage = db.Column(db.String(255), nullable=True)  # Added to match database
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Users table
    user = db.relationship('Users', backref=db.backref('characters', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'fear': self.fear,
            'sanity': self.sanity,
            'current_stage': self.current_stage,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    
