
from sqlalchemy.orm import Session
from ..model.transfer import Transfer 
from ..schema.row import Transference

# 1. Add Record Function
def db_add_record(db: Session, record: Transference):
    new_data_record = Transfer(
        id=record.id,
        sender_org_id=record.sender_org_id,
        receiver_org_id=record.receiver_org_id,
        message=record.message,
        transferred_at=record.transferred_at
    )
    db.add(new_data_record)
    db.commit()
    db.refresh(new_data_record)
    return new_data_record

# 2. Get Record Function
def db_get_records(db: Session):
    return db.query(Transfer).all()

# 3. Delete Record Function
# app/service/transfer_service.py ke andar
def db_delete_record(db: Session, record_id: int):
    
    del_record = db.query(Transfer).filter(Transfer.id == record_id).first()
    
    if not del_record:
        return False 
        
    db.delete(del_record)
    db.commit() # Ab model correct hone par crash nahi hoga
    return True

