
from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey
)

from datetime import datetime,timezone
from ..core.database import Base

class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)

    sender_org_id = Column(
        Integer,
        ForeignKey("organizations.id",ondelete="CASCADE"),
        nullable=False
    )

    receiver_org_id = Column(
        Integer,
        ForeignKey("organizations.id",ondelete="CASCADE"),
        nullable=False
    )

    message = Column(Text)

    transferred_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )