from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
from backend.db_client import db_client
from backend.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["expenses"])

class ExpenseSchema(BaseModel):
    event_id: str
    event_name: Optional[str] = ""
    description: str
    category: str  # Flowers | Transport | Labor | Materials | Other
    amount: float
    date: Optional[str] = ""

@router.get("/expenses")
async def get_expenses(request: Request, event_id: Optional[str] = None):
    await require_admin(request)
    expenses = await db_client.get_expenses(event_id=event_id)
    return expenses

@router.post("/expenses")
async def create_expense(payload: ExpenseSchema, request: Request):
    await require_admin(request)
    if not payload.description or payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Description and positive amount are required.")
    data = payload.model_dump()
    if not data.get("date"):
        data["date"] = date.today().strftime("%Y-%m-%d")
    created = await db_client.create_expense(data)
    return {"status": "success", "expense": created}

@router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, request: Request):
    await require_admin(request)
    await db_client.delete_expense(expense_id)
    return {"status": "success", "message": "Expense deleted."}
