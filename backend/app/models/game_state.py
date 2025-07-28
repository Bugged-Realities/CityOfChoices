from datetime import datetime
import json
from . import db

class GameState(db.Model):
    __tablename__ = 'game_state'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    current_stage = db.Column(db.Text, nullable=True)
    scene_id = db.Column(db.Text, nullable=True)
    choice_history = db.Column(db.JSON, nullable=True)
    current_stats = db.Column(db.JSON, nullable=True)
    inventory_snapshot = db.Column(db.JSON, nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Character table
    character = db.relationship('Character', backref=db.backref('game_states', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'current_stage': self.current_stage,
            'scene_id': self.scene_id,
            'choice_history': self.choice_history,
            'current_stats': self.current_stats,
            'inventory_snapshot': self.inventory_snapshot,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }