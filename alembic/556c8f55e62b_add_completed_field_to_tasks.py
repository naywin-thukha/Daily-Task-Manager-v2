"""Add completed field to tasks

Revision ID: 556c8f55e62b
Revises: 780c717dad55
Create Date: 2026-07-11 21:45:48.891361

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "556c8f55e62b"
down_revision: Union[str, Sequence[str], None] = "780c717dad55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # completed column already exists in the initial tasks table migration
    pass


def downgrade() -> None:
    # nothing to remove because upgrade does nothing
    pass