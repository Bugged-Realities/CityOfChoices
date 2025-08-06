"""merge multiple heads

Revision ID: ccf4576385e6
Revises: a9b48e85a532, f63ea367710a
Create Date: 2025-08-06 07:05:47.891409

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ccf4576385e6'
down_revision = ('a9b48e85a532', 'f63ea367710a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
