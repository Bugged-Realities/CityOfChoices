from datetime import datetime
from . import db

class Inventory(db.Model):
    __tablename__ = 'inventory'  # Reverted back to 'inventory'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    item_name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Character table
    character = db.relationship('Character', backref=db.backref('inventory', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'item_name': self.item_name,
            'description': self.description,
            'used': self.used,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }