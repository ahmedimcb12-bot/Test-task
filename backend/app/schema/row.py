from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Transference(BaseModel):
    id: int
    sender_org_id:int
    receiver_org_id:int
    message:str
    transferred_at:datetime

    