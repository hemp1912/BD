import json
import asyncio
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
    half_day_rate: Optional[float] = 0.0
    night_rate: Optional[float] = 0.0

class CrewMemberUpdateSchema(BaseModel):
    name: str
    role: str
    contact: Optional[str] = ""
    base_rate: Optional[float] = 0.0
    amount_owed: Optional[float] = 0.0
    payment_history: Optional[str] = "[]"
    half_day_rate: Optional[float] = 0.0
    night_rate: Optional[float] = 0.0

class CrewPaymentRequest(BaseModel):
    amount: float

@router.get("/crew")
async def get_crew(
    request: Request,
    page: Optional[int] = None,
    limit: int = 10,
    search: Optional[str] = None
):
    await require_admin(request)
    if page is not None:
        res = await db_client.get_crew(page=page, limit=limit, search=search)
        try:
            all_att = await db_client.get_all_attendance()
        except Exception:
            all_att = []
            
        worked_counts = {}
        for att in all_att:
            c_id = att.get("crew_id")
            status = att.get("status")
            if c_id and status in ("Full Day", "Half Day", "Night Work"):
                worked_counts[c_id] = worked_counts.get(c_id, 0) + 1
                
        for c in res["items"]:
            c["days_worked"] = worked_counts.get(c["id"], 0)
            
        return res
    else:
        crew = await db_client.get_crew()
        try:
            all_att = await db_client.get_all_attendance()
        except Exception:
            all_att = []
            
        worked_counts = {}
        for att in all_att:
            c_id = att.get("crew_id")
            status = att.get("status")
            if c_id and status in ("Full Day", "Half Day", "Night Work"):
                worked_counts[c_id] = worked_counts.get(c_id, 0) + 1
                
        for c in crew:
            c["days_worked"] = worked_counts.get(c["id"], 0)
            
        return crew

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

class AttendanceRecordItem(BaseModel):
    crew_id: str
    status: str  # "Absent", "Half Day", "Full Day", "Night Work"

class AttendanceSaveRequest(BaseModel):
    date: str
    records: List[AttendanceRecordItem]

@router.get("/attendance")
async def get_attendance(request: Request, date: str):
    await require_admin(request)
    if not date:
        raise HTTPException(status_code=400, detail="Date parameter is required")
    
    crew = await db_client.get_crew()
    attendance_records = await db_client.get_attendance(date)
    
    att_map = {r["crew_id"]: r for r in attendance_records}
    
    res = []
    for c in crew:
        c_id = c["id"]
        record = att_map.get(c_id)
        if record:
            res.append({
                "crew_id": c_id,
                "crew_name": c["name"],
                "base_rate": c.get("base_rate", 0.0),
                "half_day_rate": c.get("half_day_rate", 0.0),
                "night_rate": c.get("night_rate", 0.0),
                "status": record["status"],
                "calculated_pay": record["calculated_pay"],
                "exists": True,
                "id": record.get("id")
            })
        else:
            res.append({
                "crew_id": c_id,
                "crew_name": c["name"],
                "base_rate": c.get("base_rate", 0.0),
                "half_day_rate": c.get("half_day_rate", 0.0),
                "night_rate": c.get("night_rate", 0.0),
                "status": "Absent",
                "calculated_pay": 0.0,
                "exists": False
            })
            
    return res

@router.post("/attendance")
async def save_attendance(request: Request, payload: AttendanceSaveRequest):
    await require_admin(request)
    date_str = payload.date
    
    # Load all crew members to verify and get base_rates
    crew_members = await db_client.get_crew()
    crew_map = {c["id"]: c for c in crew_members}
    
    # Fetch all existing attendance records for this date in a single call
    existing_attendance = await db_client.get_attendance(date_str)
    existing_map = {r["crew_id"]: r for r in existing_attendance}
    
    db_tasks = []
    attendance_count = 0
    updated_crew = {}
    
    for item in payload.records:
        crew_id = item.crew_id
        status = item.status
        
        if crew_id not in crew_map:
            continue
            
        crew_member = crew_map[crew_id]
        base_rate = crew_member.get("base_rate", 0.0)
        hd_rate = crew_member.get("half_day_rate") or (base_rate * 0.5)
        n_rate = crew_member.get("night_rate") or (base_rate * 1.5)
        
        # Calculate new pay
        if status == "Full Day":
            new_pay = base_rate
        elif status == "Half Day":
            new_pay = hd_rate
        elif status == "Night Work":
            new_pay = n_rate
        else:  # "Absent"
            new_pay = 0.0
            
        # Check from memory-loaded dictionary instead of fetching via query
        existing = existing_map.get(crew_id)
        
        if existing:
            old_pay = existing.get("calculated_pay", 0.0)
            diff = new_pay - old_pay
            
            existing["status"] = status
            existing["calculated_pay"] = new_pay
            existing["crew_name"] = crew_member["name"]
            
            db_tasks.append(db_client.save_attendance_record(date_str, crew_id, existing))
            attendance_count += 1
        else:
            diff = new_pay
            new_record = {
                "crew_name": crew_member["name"],
                "status": status,
                "calculated_pay": new_pay
            }
            
            db_tasks.append(db_client.save_attendance_record(date_str, crew_id, new_record))
            attendance_count += 1
            
        # If wages owed changed, update the crew member state
        if diff != 0.0:
            target_crew = updated_crew.get(crew_id, crew_member)
            current_owed = target_crew.get("amount_owed", 0.0)
            target_crew["amount_owed"] = max(0.0, current_owed + diff)
            updated_crew[crew_id] = target_crew

    # Queue crew member updates
    for crew_id, crew_member in updated_crew.items():
        db_tasks.append(db_client.update_crew_member(crew_id, crew_member))
        
    # Execute all database operations concurrently
    results = await asyncio.gather(*db_tasks, return_exceptions=True)
    
    # Check for exceptions
    for res in results:
        if isinstance(res, Exception):
            print(f"[!] Error in attendance DB task execution: {res}")
            raise HTTPException(status_code=500, detail=f"Database update failed: {str(res)}")
            
    saved_records = results[:attendance_count]
    return {"status": "success", "saved_records": saved_records}

