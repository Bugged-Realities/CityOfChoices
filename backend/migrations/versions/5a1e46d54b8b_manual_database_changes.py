"""Manual database changes

Revision ID: 5a1e46d54b8b
Revises: dbb887f74019
Create Date: 2025-07-28 17:06:51.594300

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a1e46d54b8b'
down_revision = 'dbb887f74019'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        UPDATE scenes
        SET item_triggers = '[{"item": "Crystal Shard", "next": "scale_visions", "message": "The Crystal Shard unlocks a hidden archive of memories!"}]'
        WHERE id = 8;
    """)
    op.execute("""
        UPDATE scenes
        SET item_triggers = '[{"item": "Chaos Fragment", "next": "rift_creation", "message": "The Chaos Fragment creates a rift in the fabric of reality!"}]'
        WHERE id = 15;
    """)
    op.execute("""
        UPDATE scenes
        SET item_triggers = '[{"item": "Vision Fragment", "next": "ending_homebound", "message": "The Vision Fragment reveals a hidden truth about the world!"}]'
        WHERE id = 16;
    """)
    pass


def downgrade():
    pass
