from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # Add mmr column with default 1500 (typical starting MMR)
    op.add_column('users', sa.Column('mmr', sa.Integer(), nullable=False, server_default='1500'))
    # Remove the server default after the column is populated (optional cleanup)
    op.alter_column('users', 'mmr', server_default=None)

def downgrade() -> None:
    op.drop_column('users', 'mmr')
