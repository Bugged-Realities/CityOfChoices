from datetime import datetime
from . import db

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    token = db.Column(db.Text, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'token': self.token,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 