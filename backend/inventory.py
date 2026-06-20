from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.db_client import db_client
from backend.auth import require_admin

router = APIRouter(prefix="/api", tags=["inventory"])

class InventoryItemSchema(BaseModel):
    name: str
    category: str
    quantity_owned: int
    rental_price_per_day: float
    available_stock: Optional[int] = 0
    condition_status: Optional[str] = "Excellent"

class ClientSchema(BaseModel):
    name: str
    email: str
    phone: str
    address: str

# --- Warehouse Catalog CRUD ---
@router.get("/inventory")
async def get_inventory(request: Request):
    await require_admin(request)
    return await db_client.get_inventory()

@router.post("/inventory")
async def create_inventory_item(request: Request, item: InventoryItemSchema):
    await require_admin(request)
    return await db_client.create_inventory_item(item.model_dump())

@router.put("/inventory/{item_id}")
async def update_inventory_item(request: Request, item_id: str, item: InventoryItemSchema):
    await require_admin(request)
    res = await db_client.update_inventory_item(item_id, item.model_dump())
    if not res:
        raise HTTPException(status_code=404, detail="Item not found")
    return res

@router.delete("/inventory/{item_id}")
async def delete_inventory_item(request: Request, item_id: str):
    await require_admin(request)
    res = await db_client.delete_inventory_item(item_id)
    if not res:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}

# --- Clients CRUD ---
@router.get("/clients")
async def get_clients(request: Request):
    await require_admin(request)
    return await db_client.get_clients()

@router.post("/clients")
async def create_client(request: Request, client: ClientSchema):
    await require_admin(request)
    return await db_client.create_client(client.model_dump())

@router.put("/clients/{client_id}")
async def update_client(request: Request, client_id: str, client: ClientSchema):
    await require_admin(request)
    res = await db_client.update_client(client_id, client.model_dump())
    if not res:
        raise HTTPException(status_code=404, detail="Client not found")
    return res

@router.delete("/clients/{client_id}")
async def delete_client(request: Request, client_id: str):
    await require_admin(request)
    res = await db_client.delete_client(client_id)
    if not res:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "success"}
