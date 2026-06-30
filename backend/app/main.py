from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="The Data Transfering app")


# Add this block here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)









from model.transfer import Transfer
# Apni organization model file ka sahi path likhein taake table register ho sake:
from model.organization_data import OrganizationDatadb
from model.user import Organization 
from core.database import Base, engine
from fastapi import FastAPI, Depends

from router import auth, rows, orgdata
from router.auth import verify_authentication_token # Router se import kiya


Base.metadata.create_all(bind=engine)






# 1. Auth Open Endpoints (OTP mangwane aur verify karne ke liye)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

# 2. Locked Endpoints (Pehle OTP verify hoga tabhi yeh chalengi)
app.include_router(
    rows.router, 
    prefix="/rows", 
    tags=["Rows"], 
    dependencies=[Depends(verify_authentication_token)] # Lock Active
)

app.include_router(
    orgdata.router, 
    prefix="/orgdata", 
    tags=["Org Data"], 
    dependencies=[Depends(verify_authentication_token)] # Lock Active
)
