from app import db
from datetime import datetime

class GameState(db.Model):
    __tablename__ = 'game_state'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    current_stage = db.Column(db.Text)
    choice_history = db.Column(db.JSON)
    current_stats = db.Column(db.JSON)
    inventory_snapshot = db.Column(db.JSON)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    character = db.relationship('Character', back_populates='game_states')
