# app/router/rows.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schema.row import Transference
from ..core.database import get_db

# crud file se database functions import karein
from ..service.transfer_service import db_add_record, db_get_records, db_delete_record

router = APIRouter()

@router.post("/add-record")
def Add_record(record: Transference, db: Session = Depends(get_db)):
    new_record = db_add_record(db, record)
    return {"message": "Data added successfully", "data": new_record}

@router.get("/read-record")
def get_record(db: Session = Depends(get_db)):
    return db_get_records(db)


@router.delete("/delete-record/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    success = db_delete_record(db, record_id) # Apka service function
    
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
        
    
    return {
        "status": "success",
        "message": f"Record with id {record_id} has been deleted successfully"
    }

