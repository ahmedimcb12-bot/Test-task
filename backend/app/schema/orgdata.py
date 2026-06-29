from pydantic import BaseModel

class OrganizationData(BaseModel):
    id: int
    organization_id: int  # 'org_id' ko badal kar 'organization_id' kiya
    field_1: str          # 'field1' ko badal kar 'field_1' kiya
    field_2: str          # 'field2' ko badal kar 'field_2' kiya
    field_3: str          # 'field3' ko badal kar 'field_3' kiya

    class Config:
        from_attributes = True  # ORM objects ko list me convert karne ke liye lazmi hai
