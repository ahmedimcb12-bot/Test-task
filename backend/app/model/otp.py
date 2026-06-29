
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    
)

from datetime import datetime
from core.database import Base

class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String(255),
        nullable=False
    )

    otp = Column(
        String(6),
        nullable=False
    )

    verified = Column(
        Boolean,
        default=False
    )

    expires_at = Column(DateTime)