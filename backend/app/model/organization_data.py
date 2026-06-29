from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey
)


from ..core.database import Base

class OrganizationDatadb(Base):
    __tablename__ = "organization_data"

    id = Column(Integer, primary_key=True, index=True)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id",ondelete="CASCADE"),
        nullable=False
    )

    
    
    field_1 = Column(Text, server_default="unlisted", default="unlisted")
    field_2 = Column(Text, server_default="unlisted", default="unlisted")
    field_3 = Column(Text, server_default="unlisted", default="unlisted")
