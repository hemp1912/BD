import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.db_client import db_client
from backend.auth import require_admin

router = APIRouter(prefix="/api", tags=["crew"])

class CrewMemberSchema(BaseModel):
    name: str
    role: str
    contact: Optional[str] = ""
    base_rate: Optional[float] = 0.0

class CrewMemberUpdateSchema(BaseModel):
    name: str
    role: str
    contact: Optional[str] = ""
    base_rate: Optional[float] = 0.0
    amount_owed: Optional[float] = 0.0
    payment_history: Optional[str] = "[]"

class CrewPaymentRequest(BaseModel):
    amount: float

@router.get("/crew")
async def get_crew(request: Request):
    await require_admin(request)
    return await db_client.get_crew()

@router.post("/crew")
async def create_crew_member(request: Request, member: CrewMemberSchema):
    await require_admin(request)
    return await db_client.create_crew_member(member.model_dump())

@router.put("/crew/{crew_id}")
async def update_crew_member(request: Request, crew_id: str, member: CrewMemberUpdateSchema):
    await require_admin(request)
    res = await db_client.update_crew_member(crew_id, member.model_dump())
    if not res:
        raise HTTPException(status_code=404, detail="Crew member not found")
    return res

@router.delete("/crew/{crew_id}")
async def delete_crew_member(request: Request, crew_id: str):
    await require_admin(request)
    res = await db_client.delete_crew_member(crew_id)
    if not res:
        raise HTTPException(status_code=404, detail="Crew member not found")
    return {"status": "success"}

@router.post("/crew/{crew_id}/payments")
async def log_crew_payment(request: Request, crew_id: str, payload: CrewPaymentRequest):
    await require_admin(request)
    crew = await db_client.get_crew()
    member = None
    for c in crew:
        if c["id"] == crew_id:
            member = c
            break
            
    if not member:
        raise HTTPException(status_code=404, detail="Crew member not found")
        
    payment_amount = payload.amount
    current_owed = member.get("amount_owed", 0.0)
    member["amount_owed"] = max(0.0, current_owed - payment_amount)
    
    # Update payment history
    history_str = member.get("payment_history", "[]") or "[]"
    try:
        history = json.loads(history_str)
    except Exception:
        history = []
    
    history.append({
        "amount": payment_amount,
        "date": datetime.utcnow().isoformat() + "Z"
    })
    member["payment_history"] = json.dumps(history)
    
    res = await db_client.update_crew_member(crew_id, member)
    return res
