from app import db
from datetime import datetime

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    item_name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    character = db.relationship('Character', back_populates='inventory_items')

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'item_name': self.item_name,
            'description': self.description,
            'used': self.used,
            'created_at': self.created_at.isoformat()
        }
