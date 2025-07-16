from app import db
from datetime import datetime

class Character(db.Model):
    __tablename__ = 'characters'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), unique=True, nullable=False)
    name = db.Column(db.Text, nullable=False)
    fear = db.Column(db.Integer, default=0)
    sanity = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='character')
    game_states = db.relationship('GameState', back_populates='character', cascade='all, delete-orphan')
    inventory_items = db.relationship('InventoryItem', back_populates='character', cascade='all, delete-orphan') 