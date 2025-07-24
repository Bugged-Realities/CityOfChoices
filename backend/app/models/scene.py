from app import db
from datetime import datetime

class Scene(db.Model):
    __tablename__ = 'scenes'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    stage = db.Column(db.Text)
    description = db.Column(db.Text)
    options = db.Column(db.JSON)
    item_triggers = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'stage': self.stage,
            'description': self.description,
            'options': self.options,
            'created_at': self.created_at.isoformat()
        }
