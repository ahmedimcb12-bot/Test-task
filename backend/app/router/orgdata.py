from typing import List  
from fastapi import APIRouter, Depends, HTTPException, status
from ..schema.orgdata import OrganizationData
from ..core.database import get_db
from sqlalchemy.orm import Session
from ..service.Data_service import db_get_all_org_data

# Service file se functions import karein
from ..service.Data_service import db_get_all_org_data, db_add_org_data, db_update_org_data, db_delete_org_data

router = APIRouter()

@router.get("/get_all_data/{id}", response_model=List[OrganizationData])
def get_all_data(id: int, db: Session = Depends(get_db)):
    record = db_get_all_org_data(db, id)
    if not record:
        raise HTTPException(status_code=404, detail="No records found for this Organization")
    return record     

@router.post("/Add_Data")
def add_data(org_data: OrganizationData, db: Session = Depends(get_db)): 
    return db_add_org_data(db, org_data)

@router.put("/update-data/{record_id}", status_code=status.HTTP_200_OK)
def update_organization_data(record_id: int, payload: OrganizationData, db: Session = Depends(get_db)):
    updated_record = db_update_org_data(db, record_id, payload)
    if not updated_record:
        raise HTTPException(status_code=404, detail=f"Record with id {record_id} not found")
    return {"message": "Data updated successfully", "updated_record": updated_record}

@router.delete("/delete-data/{record_id}", status_code=status.HTTP_200_OK)
def delete_organization_data(record_id: int, db: Session = Depends(get_db)):
    success = db_delete_org_data(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Record with id {record_id} not found")
    return {"status": "success", "message": "Record deleted successfully"}
