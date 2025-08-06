from datetime import datetime
import json
from . import db

class GameState(db.Model):
    __tablename__ = 'game_states'  # Changed to match actual table name
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    stage_id = db.Column(db.String(255), nullable=True)  # Changed from scene_id to stage_id
    game_data = db.Column(db.JSON, nullable=True)  # Changed to match actual column
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Changed from last_updated

    # Relationship to Character table
    character = db.relationship('Character', backref=db.backref('game_states', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'stage_id': self.stage_id,
            'game_data': self.game_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }