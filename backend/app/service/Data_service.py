# app/router/service.py
from sqlalchemy.orm import Session
from ..model.transfer import Transfer 
from ..schema.row import Transference
from ..model.organization_data import OrganizationDatadb
from ..schema.orgdata import OrganizationData


# ==========================================
#  ORGANIZATION DATA SERVICE FUNCTIONS
# ==========================================

def db_get_all_org_data(db: Session, org_id: int):
    return db.query(OrganizationDatadb).filter(OrganizationDatadb.organization_id == org_id).all()

def db_add_org_data(db: Session, org_data: OrganizationData):
    new_db_record = OrganizationDatadb(
        id=org_data.id,
        organization_id=org_data.organization_id,
        field_1=org_data.field_1, 
        field_2=org_data.field_2,
        field_3=org_data.field_3
    )
    db.add(new_db_record)
    db.commit()
    db.refresh(new_db_record)
    return new_db_record

def db_update_org_data(db: Session, record_id: int, payload: OrganizationData):
    db_record = db.query(OrganizationDatadb).filter(OrganizationDatadb.id == record_id).first()
    if not db_record:
        return None
    
    update_data = payload.model_dump(exclude_unset=True) 
    for key, value in update_data.items():
        setattr(db_record, key, value) 
        
    db.commit()
    db.refresh(db_record)
    return db_record

def db_delete_org_data(db: Session, record_id: int):
    db_record = db.query(OrganizationDatadb).filter(OrganizationDatadb.id == record_id).first()
    if not db_record:
        return False
    db.delete(db_record)
    db.commit()
    return True
