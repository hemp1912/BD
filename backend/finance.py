import os
import json
import uuid
import datetime as dt
from datetime import datetime, date
from typing import Dict, List, Optional
import random
import string
from fastapi import APIRouter, HTTPException, Request, status, File, UploadFile, BackgroundTasks
from pydantic import BaseModel
from backend import config
from appwrite.input_file import InputFile
from backend.db_client import db_client
from backend.auth import require_admin, get_current_session, require_admin_or_labor
from backend.alerts import dispatch_telegram_alert

router = APIRouter(prefix="/api", tags=["finance"])

def generate_portal_token() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=12))

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "uploads")

# Helper to parse dates
def parse_date(date_str: str) -> date:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        return date.today()

def event_is_assigned_to_user(event: dict, user_id: str) -> bool:
    try:
        crew = json.loads(event.get("crew_assignments", "[]"))
        return any(worker.get("worker_id") == user_id for worker in crew)
    except Exception:
        return False

def sanitize_event_for_labor(event: dict) -> dict:
    sanitized_crew = []
    try:
        for worker in json.loads(event.get("crew_assignments", "[]")):
            sanitized_crew.append({
                "worker_id": worker.get("worker_id"),
                "name": worker.get("name", "")
            })
    except Exception:
        pass

    return {
        "id": event.get("id"),
        "client_name": event.get("client_name"),
        "venue_address": event.get("venue_address"),
        "start_date": event.get("start_date"),
        "end_date": event.get("end_date"),
        "status": event.get("status"),
        "design_layout_url": event.get("design_layout_url", ""),
        "crew_assignments": json.dumps(sanitized_crew),
    }

class EventSchema(BaseModel):
    client_id: str
    client_name: str
    venue_address: str
    start_date: str
    end_date: str
    status: str = "Draft"
    design_layout_url: Optional[str] = ""
    items_booked: str  # JSON String map {item_id: quantity}
    total_invoice_amount: Optional[float] = 0.0
    amount_paid: Optional[float] = 0.0
    remaining_balance: Optional[float] = 0.0
    crew_assignments: Optional[str] = "[]" # JSON array
    payment_history: Optional[str] = "[]" # JSON array of receipts
    max_workforce_capacity: Optional[int] = 4
    notes: Optional[str] = ""
    discount: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0
    portal_token: Optional[str] = ""
    progress_stage: Optional[int] = 0

class PaymentRequest(BaseModel):
    amount: float
    payment_method: str = "Cash"

class ReminderRequest(BaseModel):
    to_email: Optional[str] = None

class TaskSchema(BaseModel):
    event_id: str
    description: str
    status: str = "Pending"
    assigned_to: Optional[str] = ""

# --- Calculation Helpers ---
async def calculate_invoice_total(start_date: str, end_date: str, items_booked: Dict[str, int], discount: float = 0.0, tax_rate: float = 0.0, notes: str = "") -> float:
    s_date = parse_date(start_date)
    e_date = parse_date(end_date)
    days = max(1, (e_date - s_date).days + 1)
    
    inventory = await db_client.get_inventory()
    inv_map = {item.get("id"): item for item in inventory if item.get("id")}
    
    subtotal = 0.0
    for item_id, quantity in items_booked.items():
        if item_id in inv_map:
            price = inv_map[item_id].get("rental_price_per_day", 0.0)
            subtotal += price * quantity * days
            
    # Try to parse notes as JSON and add custom items costs
    if notes:
        try:
            notes_data = json.loads(notes)
            if isinstance(notes_data, dict) and "custom_items" in notes_data:
                for c_item in notes_data["custom_items"]:
                    qty = int(c_item.get("qty") or 0)
                    rate = float(c_item.get("rate") or 0.0)
                    subtotal += qty * rate * days
        except Exception:
            pass
            
    after_discount = max(0.0, subtotal - discount)
    total = after_discount * (1 + tax_rate / 100.0)
    return round(total, 2)

async def check_inventory_overlap(start_date: str, end_date: str, items_booked: Dict[str, int], exclude_event_id: Optional[str] = None) -> List[dict]:
    s_date = parse_date(start_date)
    e_date = parse_date(end_date)
    
    inventory = await db_client.get_inventory()
    item_map = {item.get("id"): item for item in inventory if item.get("id")}
    
    events = await db_client.get_events()
    overlapping_events = []
    for evt in events:
        if exclude_event_id and evt.get("id") == exclude_event_id:
            continue
        if evt.get("status") == "Cancelled":
            continue
            
        evt_start = parse_date(evt.get("start_date", ""))
        evt_end = parse_date(evt.get("end_date", ""))
        
        if s_date <= evt_end and evt_start <= e_date:
            overlapping_events.append(evt)
            
    shortages = []
    current_date = s_date
    while current_date <= e_date:
        daily_reservations = {}
        for evt in overlapping_events:
            evt_start = parse_date(evt.get("start_date", ""))
            evt_end = parse_date(evt.get("end_date", ""))
            if evt_start <= current_date <= evt_end:
                try:
                    booked = json.loads(evt.get("items_booked", "{}"))
                    for item_id, qty in booked.items():
                        daily_reservations[item_id] = daily_reservations.get(item_id, 0) + qty
                except Exception:
                    pass
                    
        for item_id, qty_requested in items_booked.items():
            if item_id in item_map:
                owned = item_map[item_id].get("quantity_owned", 0)
                in_use = daily_reservations.get(item_id, 0)
                available = owned - in_use
                if qty_requested > available:
                    shortage_qty = qty_requested - available
                    shortages.append({
                        "item_id": item_id,
                        "name": item_map[item_id].get("name", "Unknown Item"),
                        "date_checked": str(current_date),
                        "requested": qty_requested,
                        "available": available,
                        "owned": owned,
                        "shortage": shortage_qty
                    })
                    
        current_date += dt.timedelta(days=1)
        
    unique_shortages = {}
    for sh in shortages:
        item_id = sh["item_id"]
        if item_id not in unique_shortages or sh["shortage"] > unique_shortages[item_id]["shortage"]:
            unique_shortages[item_id] = sh
            
    return list(unique_shortages.values())

async def check_crew_capacity(start_date: str, end_date: str, workforce_capacity: int, exclude_event_id: Optional[str] = None) -> Optional[dict]:
    s_date = parse_date(start_date)
    e_date = parse_date(end_date)
    
    events = await db_client.get_events()
    concurrent_events = []
    
    for evt in events:
        if exclude_event_id and evt.get("id") == exclude_event_id:
            continue
        evt_start = parse_date(evt.get("start_date", ""))
        evt_end = parse_date(evt.get("end_date", ""))
        
        if s_date <= evt_end and evt_start <= e_date:
            concurrent_events.append(evt)
            
    weekend_jobs_count = 0
    for evt in concurrent_events:
        evt_start = parse_date(evt.get("start_date", ""))
        evt_end = parse_date(evt.get("end_date", ""))
        
        temp_date = evt_start
        is_weekend_evt = False
        while temp_date <= evt_end:
            if temp_date.weekday() in [5, 6]:
                is_weekend_evt = True
                break
            temp_date += dt.timedelta(days=1)
            
        if is_weekend_evt:
            weekend_jobs_count += 1
            
    target_has_weekend = False
    temp_date = s_date
    while temp_date <= e_date:
        if temp_date.weekday() in [5, 6]:
            target_has_weekend = True
            break
        temp_date += dt.timedelta(days=1)
        
    if target_has_weekend:
        total_concurrent_weekend_jobs = weekend_jobs_count + 1
        capacity_limit = 2 
        if total_concurrent_weekend_jobs > capacity_limit:
            return {
                "active_weekend_jobs": total_concurrent_weekend_jobs,
                "limit": capacity_limit,
                "message": f"Capacity Warning: Scheduling {total_concurrent_weekend_jobs} concurrent jobs on a weekend. Maximum recommended threshold is {capacity_limit}."
            }
            
    return None

# --- REST Routes ---

def add_payment_status(evt: dict) -> dict:
    if not evt:
        return evt
    evt = dict(evt)
    amount_paid = evt.get("amount_paid") or 0.0
    remaining_balance = evt.get("remaining_balance") or 0.0
    if remaining_balance <= 0:
        status_str = "Fully Paid"
    elif amount_paid > 0:
        status_str = "Partially Paid"
    else:
        status_str = "Unpaid"
    evt["payment_status"] = status_str
    return evt

async def ensure_portal_token(evt: dict) -> dict:
    """Auto-generate and save portal_token for events that are missing one."""
    if not evt:
        return evt
    if not evt.get("portal_token"):
        token = generate_portal_token()
        evt["portal_token"] = token
        try:
            await db_client.update_event(evt["id"], {"portal_token": token})
        except Exception as e:
            print(f"[!] Failed to persist portal_token for event {evt.get('id')}: {e}")
    return evt

@router.get("/events")
async def get_events(
    request: Request,
    page: Optional[int] = None,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    payment_status: Optional[str] = None
):
    session = await require_admin_or_labor(request)
    is_labor = session.get("role") == "labor"
    user_id = session.get("id")
    
    if page is not None:
        res = await db_client.get_events(page=page, limit=limit, search=search, status=status, payment_status=payment_status)
        if is_labor:
            filtered_items = []
            for evt in res["items"]:
                if event_is_assigned_to_user(evt, user_id):
                    filtered_items.append(sanitize_event_for_labor(evt))
            res["items"] = filtered_items
            res["total"] = len(filtered_items)
            res.pop("stats", None)
        else:
            patched = []
            for evt in res["items"]:
                patched.append(add_payment_status(await ensure_portal_token(evt)))
            res["items"] = patched
        return res
    else:
        events = await db_client.get_events(search=search, status=status, payment_status=payment_status)
        if is_labor:
            filtered_events = []
            for evt in events:
                if event_is_assigned_to_user(evt, user_id):
                    filtered_events.append(sanitize_event_for_labor(evt))
            return filtered_events
        else:
            patched = []
            for evt in events:
                patched.append(add_payment_status(await ensure_portal_token(evt)))
            return patched

@router.get("/events/{event_id}/portal-link")
async def get_event_portal_link(request: Request, event_id: str):
    """Returns (and auto-generates if missing) the secure client portal link for an event."""
    await require_admin(request)
    res = await db_client.get_event(event_id)
    if not res:
        raise HTTPException(status_code=404, detail="Event not found")
    res = await ensure_portal_token(res)
    token = res.get("portal_token", "")
    if not token:
        raise HTTPException(status_code=500, detail="Failed to generate portal token.")
    return {"portal_token": token, "portal_link": f"/portal/{token}"}

@router.post("/events/{event_id}/send-reminder")
async def send_event_payment_reminder(request: Request, event_id: str, body: Optional[ReminderRequest] = None):
    await require_admin(request)
    
    # Check SMTP configuration
    import os
    if not (os.getenv("TESTING") == "true" or os.getenv("DISABLE_EMAIL") == "true"):
        settings = await db_client.get_settings()
        smtp_host = settings.get("smtp_host") or "smtp.gmail.com"
        smtp_user = settings.get("smtp_user")
        smtp_pass = settings.get("smtp_pass")
        if not smtp_host or not smtp_user or not smtp_pass:
            raise HTTPException(status_code=400, detail="SMTP Configuration (host, user, pass) is incomplete. Please configure it in System Settings.")

    event_data = await db_client.get_event(event_id)
    if not event_data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event_data = await ensure_portal_token(event_data)
    event_data = add_payment_status(event_data)
    
    from backend.mail_helper import get_event_email_context, send_system_email
    db_email, email_context = await get_event_email_context(event_data, request)
    
    # Prefer email passed from frontend (which already fetched client), fall back to DB-resolved email
    supplied_email = (body.to_email or "").strip() if body else ""
    client_email = supplied_email or db_email
    
    if not client_email:
        raise HTTPException(status_code=400, detail="Client email address is missing or invalid for this booking. Please add an email address to the client record.")
        
    if (event_data.get("remaining_balance") or 0.0) <= 0:
        raise HTTPException(status_code=400, detail="This booking has no outstanding remaining balance due.")
        
    success = await send_system_email(client_email, "reminder", email_context)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send payment reminder email via SMTP. Please check your SMTP settings or server logs.")
        
    return {"status": "success", "message": f"Payment reminder email successfully sent to {client_email} for client {event_data.get('client_name')}."}

@router.post("/finance/send-bulk-reminders")
async def send_bulk_payment_reminders(request: Request):
    await require_admin(request)
    
    # Check SMTP configuration
    import os
    if not (os.getenv("TESTING") == "true" or os.getenv("DISABLE_EMAIL") == "true"):
        settings = await db_client.get_settings()
        smtp_host = settings.get("smtp_host") or "smtp.gmail.com"
        smtp_user = settings.get("smtp_user")
        smtp_pass = settings.get("smtp_pass")
        if not smtp_host or not smtp_user or not smtp_pass:
            raise HTTPException(status_code=400, detail="SMTP Configuration (host, user, pass) is incomplete. Please configure it in System Settings.")

    events = await db_client.get_events()
    
    from backend.mail_helper import get_event_email_context, send_system_email
    import asyncio
    
    email_tasks = []
    skipped_count = 0
    
    for evt in events:
        evt_status = evt.get("status", "")
        if evt_status in ["Cancelled", "Completed"]:
            continue
            
        remaining = evt.get("remaining_balance") or 0.0
        if remaining <= 0:
            continue
            
        evt = await ensure_portal_token(evt)
        client_email, email_context = await get_event_email_context(evt, request)
        if client_email:
            email_tasks.append(send_system_email(client_email, "reminder", email_context))
        else:
            skipped_count += 1
            
    sent_count = 0
    if email_tasks:
        results = await asyncio.gather(*email_tasks, return_exceptions=True)
        for r in results:
            if r is True:
                sent_count += 1
            else:
                skipped_count += 1
                
    return {"status": "success", "sent_count": sent_count, "skipped_count": skipped_count}

@router.get("/events/{event_id}")
async def get_event(request: Request, event_id: str):
    session = await require_admin_or_labor(request)
    res = await db_client.get_event(event_id)
    if not res:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if session.get("role") == "labor":
        if not event_is_assigned_to_user(res, session.get("id")):
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this event.")
        return sanitize_event_for_labor(res)
    
    res = await ensure_portal_token(res)
    res = add_payment_status(res)

    # ── Resolve booked items for PDF/invoice usage ──────────────────────────
    inventory = await db_client.get_inventory()
    inv_map = {item.get("id"): item for item in inventory if item.get("id")}

    try:
        items_booked = json.loads(res.get("items_booked", "{}"))
    except Exception:
        items_booked = {}

    try:
        from datetime import datetime as _dt
        s_date = _dt.strptime(res.get("start_date", ""), "%Y-%m-%d").date()
        e_date = _dt.strptime(res.get("end_date",   ""), "%Y-%m-%d").date()
        rental_days = max(1, (e_date - s_date).days + 1)
    except Exception:
        rental_days = 1

    resolved_items = []
    for item_id, qty in items_booked.items():
        if item_id in inv_map:
            item_info = inv_map[item_id]
            rate = float(item_info.get("rental_price_per_day", 0.0))
            cost = rate * int(qty) * rental_days
            resolved_items.append({
                "item_id":  item_id,
                "name":     item_info.get("name", "Unknown Item"),
                "category": item_info.get("category", "General"),
                "quantity": int(qty),
                "rate":     rate,
                "cost":     cost
            })

    # Include custom items from notes
    notes = res.get("notes", "")
    if notes:
        try:
            notes_data = json.loads(notes)
            if isinstance(notes_data, dict) and "custom_items" in notes_data:
                for c_item in notes_data["custom_items"]:
                    qty  = int(c_item.get("qty") or 0)
                    rate = float(c_item.get("rate") or 0.0)
                    resolved_items.append({
                        "item_id":  "custom",
                        "name":     c_item.get("desc", "Custom Item"),
                        "category": "Custom",
                        "quantity": qty,
                        "rate":     rate,
                        "cost":     qty * rate * rental_days
                    })
        except Exception:
            pass

    res["resolved_items"] = resolved_items
    res["rental_days"]    = rental_days
    return res

@router.post("/events")
async def create_event(request: Request, event: EventSchema, background_tasks: BackgroundTasks):
    await require_admin(request)
    event_data = event.model_dump()
    event_data.setdefault("payment_history", "[]")
    if not event_data.get("portal_token"):
        event_data["portal_token"] = generate_portal_token()

    
    conflict_alerts = await check_inventory_overlap(
        event_data["start_date"], 
        event_data["end_date"], 
        json.loads(event_data["items_booked"])
    )
    
    total_cost = await calculate_invoice_total(
        event_data["start_date"], 
        event_data["end_date"], 
        json.loads(event_data["items_booked"]),
        discount=event_data.get("discount") or 0.0,
        tax_rate=event_data.get("tax_rate") or 0.0,
        notes=event_data.get("notes") or ""
    )
    event_data["total_invoice_amount"] = total_cost
    event_data["remaining_balance"] = total_cost - event_data["amount_paid"]
    
    if event_data["remaining_balance"] <= 0:
        event_data["status"] = "Completed"

    capacity_alert = await check_crew_capacity(
        event_data["start_date"], 
        event_data["end_date"],
        event_data.get("max_workforce_capacity", 4)
    )

    created_event = await db_client.create_event(event_data)
    
    alert_summary = f"New Event Booked!\nClient: {event.client_name}\nVenue: {event.venue_address}\nDates: {event.start_date} to {event.end_date}\nInvoice Total: ${total_cost:.2f}"
    await dispatch_telegram_alert(alert_summary)

    # Trigger Booking Confirmation Email in the background
    try:
        from backend.mail_helper import get_event_email_context, send_system_email
        client_email, email_context = await get_event_email_context(created_event, request)
        if client_email:
            background_tasks.add_task(send_system_email, client_email, "confirmation", email_context)
    except Exception as e:
        print(f"Error scheduling confirmation email: {e}")

    return {
        "event": add_payment_status(created_event),
        "conflict_alerts": conflict_alerts,
        "capacity_alert": capacity_alert
    }

@router.put("/events/{event_id}")
async def update_event(request: Request, event_id: str, event: EventSchema, background_tasks: BackgroundTasks):
    await require_admin(request)
    existing_event = await db_client.get_event(event_id)
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")

    event_data = dict(existing_event)
    event_data.update(event.model_dump())
    event_data["amount_paid"] = existing_event.get("amount_paid", 0.0)
    event_data["payment_history"] = existing_event.get("payment_history", "[]")
    event_data["design_layout_url"] = existing_event.get("design_layout_url", event_data.get("design_layout_url", ""))
    if not event_data.get("portal_token"):
        event_data["portal_token"] = existing_event.get("portal_token") or generate_portal_token()

    
    conflict_alerts = await check_inventory_overlap(
        event_data["start_date"], 
        event_data["end_date"], 
        json.loads(event_data["items_booked"]),
        exclude_event_id=event_id
    )
    
    total_cost = await calculate_invoice_total(
        event_data["start_date"], 
        event_data["end_date"], 
        json.loads(event_data["items_booked"]),
        discount=event_data.get("discount") or 0.0,
        tax_rate=event_data.get("tax_rate") or 0.0,
        notes=event_data.get("notes") or ""
    )
    event_data["total_invoice_amount"] = total_cost
    event_data["remaining_balance"] = total_cost - event_data["amount_paid"]
    
    if event_data["remaining_balance"] <= 0:
        event_data["status"] = "Completed"

    capacity_alert = await check_crew_capacity(
        event_data["start_date"], 
        event_data["end_date"],
        event_data.get("max_workforce_capacity", 4),
        exclude_event_id=event_id
    )

    updated_event = await db_client.update_event(event_id, event_data)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    alert_summary = f"Event Updated!\nClient: {event.client_name}\nVenue: {event.venue_address}\nDates: {event.start_date} to {event.end_date}\nInvoice Total: ${total_cost:.2f}"
    await dispatch_telegram_alert(alert_summary)

    # Check for Completion Transitions & Trigger Completed/Thank-You Email
    old_stage = existing_event.get("progress_stage")
    new_stage = updated_event.get("progress_stage")
    old_status = existing_event.get("status")
    new_status = updated_event.get("status")
    if (new_status == "Completed" and old_status != "Completed") or (new_stage == 3 and old_stage != 3):
        try:
            from backend.mail_helper import get_event_email_context, send_system_email
            client_email, email_context = await get_event_email_context(updated_event, request)
            if client_email:
                background_tasks.add_task(send_system_email, client_email, "completed", email_context)
        except Exception as e:
            print(f"Error scheduling completed email: {e}")

    return {
        "event": add_payment_status(updated_event),
        "conflict_alerts": conflict_alerts,
        "capacity_alert": capacity_alert
    }

@router.delete("/events/{event_id}")
async def delete_event(request: Request, event_id: str):
    await require_admin(request)
    res = await db_client.delete_event(event_id)
    if not res:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "success"}

@router.post("/events/{event_id}/payments")
async def log_payment(request: Request, event_id: str, payment: PaymentRequest):
    await require_admin(request)
    event = await db_client.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    amount_paid = event.get("amount_paid", 0.0) + payment.amount
    total_invoice = event.get("total_invoice_amount", 0.0)
    remaining_balance = max(0.0, total_invoice - amount_paid)
    
    event["amount_paid"] = amount_paid
    event["remaining_balance"] = remaining_balance
    try:
        history = json.loads(event.get("payment_history", "[]"))
    except Exception:
        history = []
    history.append({
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "received_at": datetime.utcnow().isoformat() + "Z"
    })
    event["payment_history"] = json.dumps(history)
    
    if remaining_balance <= 0:
        event["status"] = "Completed"
        
    updated = await db_client.update_event(event_id, event)
    
    alert_summary = f"Payment Received!\nClient: {event.get('client_name')}\nCollected: ${payment.amount:.2f}\nRemaining Balance: ${remaining_balance:.2f}"
    await dispatch_telegram_alert(alert_summary)
    
    return add_payment_status(updated)

@router.post("/events/{event_id}/upload-layout")
async def upload_layout(request: Request, event_id: str, file: UploadFile = File(...)):
    session = await require_admin_or_labor(request)
    event = await db_client.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if session.get("role") == "labor":
        if not event_is_assigned_to_user(event, session.get("id")):
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this event.")
        
    if config.DB_TYPE == "APPWRITE":
        try:
            temp_path = os.path.join(UPLOAD_DIR, f"temp_{file.filename}")
            with open(temp_path, "wb") as f:
                f.write(await file.read())
            
            res = db_client.storage.create_file(
                config.APPWRITE_STORAGE_BUCKET_ID,
                "unique()",
                InputFile.from_path(temp_path)
            )
            os.remove(temp_path)
            
            file_id = res.id if hasattr(res, "id") else res["$id"]
            file_url = f"{config.APPWRITE_ENDPOINT}/storage/buckets/{config.APPWRITE_STORAGE_BUCKET_ID}/files/{file_id}/view?project={config.APPWRITE_PROJECT_ID}"
            event["design_layout_url"] = file_url
            await db_client.update_event(event_id, event)
            return {"url": file_url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Appwrite storage upload failed: {e}")
    else:
        filename = f"{event_id}_{int(datetime.now().timestamp())}_{file.filename}"
        dest_path = os.path.join(UPLOAD_DIR, filename)
        with open(dest_path, "wb") as f:
            f.write(await file.read())
            
        file_url = f"/static/uploads/{filename}"
        event["design_layout_url"] = file_url
        await db_client.update_event(event_id, event)
        return {"url": file_url}

# --- Tasks Routes ---
@router.get("/events/{event_id}/tasks")
async def get_tasks_for_event(request: Request, event_id: str):
    session = await require_admin_or_labor(request)
    event = await db_client.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if session.get("role") == "labor":
        if not event_is_assigned_to_user(event, session.get("id")):
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this event.")
            
    return await db_client.get_tasks_for_event(event_id)

@router.post("/tasks")
async def create_task(request: Request, task: TaskSchema):
    await require_admin(request)
    return await db_client.create_task(task.model_dump())

@router.put("/tasks/{task_id}")
async def update_task_status(request: Request, task_id: str, status_payload: Dict[str, str]):
    session = await require_admin_or_labor(request)
    tasks = await db_client.get_tasks()
    target_task = None
    for task in tasks:
        if task["id"] == task_id:
            target_task = task
            break
            
    if not target_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if session.get("role") == "labor":
        event_id = target_task.get("event_id")
        event = await db_client.get_event(event_id)
        if not event or not event_is_assigned_to_user(event, session.get("id")):
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this task's event.")
            
    target_task["status"] = status_payload.get("status", target_task["status"])
    updated_task = await db_client.update_task(task_id, target_task)
    return updated_task

@router.delete("/tasks/{task_id}")
async def delete_task(request: Request, task_id: str):
    await require_admin(request)
    res = await db_client.delete_task(task_id)
    if not res:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success"}

# --- Analytics Summary & Payroll Release ---
@router.get("/dashboard/overview")
async def get_dashboard_overview(request: Request):
    await require_admin(request)
    
    import asyncio
    events_task = db_client.get_events()
    inventory_task = db_client.get_inventory()
    tasks_task = db_client.get_tasks()
    crew_task = db_client.get_crew()
    
    events, inventory, tasks, crew = await asyncio.gather(
        events_task, inventory_task, tasks_task, crew_task
    )
    
    active_bookings = sum(1 for e in events if e.get("status") in ("Confirmed", "Draft"))
    pending_tasks = sum(1 for t in tasks if t.get("status") == "Pending")
    
    crew_on_duty_set = set()
    for e in events:
        if e.get("status") in ("Confirmed", "Draft"):
            try:
                assignments = json.loads(e.get("crew_assignments") or "[]")
                for worker in assignments:
                    w_id = worker.get("worker_id")
                    if w_id:
                        crew_on_duty_set.add(w_id)
            except Exception:
                pass
    crew_on_duty = len(crew_on_duty_set)
    
    low_stock_count = 0
    for item in inventory:
        owned = item.get("quantity_owned", 0)
        avail = item.get("available_stock")
        if avail is None:
            avail = owned
        if owned > 0 and (avail / owned) <= 0.20:
            low_stock_count += 1
            
    return {
        "events": [add_payment_status(e) for e in events],
        "stats": {
            "active_bookings": active_bookings,
            "pending_tasks": pending_tasks,
            "crew_on_duty": crew_on_duty,
            "low_stock_alerts": low_stock_count
        }
    }

@router.get("/analytics/summary")
async def get_dashboard_summary(request: Request):
    await require_admin(request)
    events = await db_client.get_events()
    total_sales = 0.0
    total_receivable = 0.0
    total_crew_wages = 0.0
    
    for e in events:
        total_sales += e.get("total_invoice_amount") or 0.0
        total_receivable += e.get("remaining_balance") or 0.0
        
        try:
            crew = json.loads(e.get("crew_assignments") or "[]")
            for worker in crew:
                total_crew_wages += worker.get("pay_rate") or 0.0
        except Exception:
            pass

    net_profit = total_sales - total_crew_wages
    net_margin_percentage = (net_profit / total_sales * 100) if total_sales > 0 else 0.0
    
    return {
        "total_sales": total_sales,
        "total_receivable": total_receivable,
        "total_wages": total_crew_wages,
        "net_profit": net_profit,
        "net_margin_percentage": round(net_margin_percentage, 2)
    }

@router.put("/events/{event_id}/crew/{crew_index}/toggle-paid")
async def toggle_crew_paid_status(request: Request, event_id: str, crew_index: int):
    await require_admin(request)
    event = await db_client.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    try:
        crew_assignments = json.loads(event.get("crew_assignments", "[]"))
        if 0 <= crew_index < len(crew_assignments):
            crew_assignments[crew_index]["paid"] = not crew_assignments[crew_index].get("paid", False)
            event["crew_assignments"] = json.dumps(crew_assignments)
            updated_event = await db_client.update_event(event_id, event)
            return add_payment_status(updated_event)
        else:
            raise HTTPException(status_code=404, detail="Crew member not found at this index")
    except (json.JSONDecodeError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid crew assignment data")
