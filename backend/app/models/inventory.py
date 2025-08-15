from datetime import datetime
from . import db

class Inventory(db.Model):
    __tablename__ = 'inventory'  # Fixed to match actual table name
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    character_id = db.Column(db.BigInteger, db.ForeignKey('characters.id'), nullable=False)
    item_name = db.Column(db.Text, nullable=False)  # Fixed to match database
    description = db.Column(db.Text, nullable=True)  # Fixed to match database
    used = db.Column(db.Boolean, nullable=False)  # Fixed to match database
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