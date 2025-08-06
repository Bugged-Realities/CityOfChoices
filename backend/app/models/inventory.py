from datetime import datetime
from . import db

class Inventory(db.Model):
    __tablename__ = 'inventories'  # Changed to match actual table name
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    items = db.Column(db.JSON, nullable=True)  # Changed to match actual column
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Character table
    character = db.relationship('Character', backref=db.backref('inventory', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'items': self.items,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }