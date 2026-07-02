import os
from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from backend import auth, inventory, finance, alerts, gallery, crew, callbacks, testimonials, expenses
from backend.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(
    title="Event Decoration & Logistics Management API",
    version="1.5",
    description="Backend services for tracking warehouse stocks, event crew scheduling, and client invoices.",
    # docs_url=None,
    # redoc_url=None,
    # openapi_url=None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(finance.router)
app.include_router(alerts.router)
app.include_router(gallery.router)
app.include_router(crew.router)
app.include_router(callbacks.router)
app.include_router(testimonials.router)
app.include_router(expenses.router)


# Define file paths
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
UPLOAD_DIR = os.path.join(FRONTEND_DIR, "uploads")
SEED_IMG_PATH = os.path.join(FRONTEND_DIR, "seed_layout_1.jpg")

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper to write a dummy seed layout image if it doesn't exist
if not os.path.exists(SEED_IMG_PATH):
    try:
        with open(SEED_IMG_PATH, "wb") as f:
            f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9")
    except Exception as e:
        print(f"[*] Could not seed image layout file: {e}")

# Serve app.js and styles.css directly
@app.get("/styles.css")
async def get_styles():
    return FileResponse(os.path.join(FRONTEND_DIR, "styles.css"))

@app.get("/app.js")
async def get_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "app.js"))

@app.get("/common.js")
async def get_common_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "common.js"))

@app.get("/login.js")
async def get_login_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "login.js"))

@app.get("/admin.js")
async def get_admin_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "admin.js"))

@app.get("/crew.js")
async def get_crew_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "crew.js"))

@app.get("/robots.txt")
async def get_robots():
    content = "User-agent: *\nAllow: /\n\nSitemap: https://www.bhoomidecoration.com/sitemap.xml\n"
    from fastapi.responses import Response
    return Response(content=content, media_type="text/plain")

@app.get("/sitemap.xml")
async def get_sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.bhoomidecoration.com/</loc>
    <lastmod>2026-06-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>"""
    from fastapi.responses import Response
    return Response(content=content, media_type="application/xml")

# Direct uploads access path
@app.get("/static/uploads/{filename}")
async def get_upload_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

# Seed layout image loader
@app.get("/static/seed_layout_1.jpg")
async def get_seed_layout():
    if os.path.exists(SEED_IMG_PATH):
        return FileResponse(SEED_IMG_PATH)
    raise HTTPException(status_code=404, detail="Layout template image not found")

# Main Page Loader
@app.get("/", response_class=HTMLResponse)
async def get_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h3>Error: index.html not found in frontend directory.</h3>"

@app.get("/admin.html", response_class=HTMLResponse)
@app.get("/admin", response_class=HTMLResponse)
async def get_admin():
    admin_path = os.path.join(FRONTEND_DIR, "admin.html")
    if os.path.exists(admin_path):
        with open(admin_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h3>Error: admin.html not found.</h3>"

@app.get("/surprise", response_class=HTMLResponse)
@app.get("/surprise.html", response_class=HTMLResponse)
async def get_surprise():
    surprise_path = os.path.join(FRONTEND_DIR, "surprise.html")
    if os.path.exists(surprise_path):
        with open(surprise_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h3>Error: surprise.html not found.</h3>"

@app.get("/crew.html", response_class=HTMLResponse)
@app.get("/crew", response_class=HTMLResponse)
async def get_crew():
    crew_path = os.path.join(FRONTEND_DIR, "crew.html")
    if os.path.exists(crew_path):
        with open(crew_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h3>Error: crew.html not found.</h3>"

# ─── Public Server Warmup Ping Endpoint ──────────────────────────────────────
@app.get("/api/ping")
async def ping():
    return {"status": "ok"}

# ─── Protected Session Admin Check Endpoint ──────────────────────────────────
@app.get("/api/me")
async def get_me(request: Request):
    from backend.auth import require_admin
    session = await require_admin(request)
    return {
        "status": "success",
        "user": {
            "id": session.get("id"),
            "email": session.get("email"),
            "name": session.get("name"),
            "role": session.get("role")
        }
    }

# ─── Client Portal Page Loader ───────────────────────────────────────────────
@app.get("/portal/{token}", response_class=HTMLResponse)
async def get_client_portal(token: str):
    portal_path = os.path.join(FRONTEND_DIR, "portal.html")
    if os.path.exists(portal_path):
        with open(portal_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h3>Error: portal.html not found.</h3>"

# ─── Public Client Portal Data Endpoint (Authorized by token) ────────────────
@app.get("/api/portal/{token}")
async def get_portal_data(token: str):
    from datetime import datetime, timedelta
    from backend.db_client import db_client
    import json
    
    # 1. Fetch all events and find the matching portal_token
    events = await db_client.get_events()
    target_event = None
    for e in events:
        if e.get("portal_token") == token:
            target_event = e
            break
            
    if not target_event:
        raise HTTPException(status_code=404, detail="Portal link not found or invalid.")
        
    # 2. Check expiration (30 days after event end_date)
    end_date_str = target_event.get("end_date", "")
    try:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        if datetime.now().date() > end_date + timedelta(days=30):
            raise HTTPException(status_code=410, detail="This self-service portal link has expired (valid up to 30 days post-event).")
    except Exception as parse_err:
        print(f"[!] Error parsing event end_date for expiration: {parse_err}")
        
    # 3. Resolve booked items names, rates, and costs
    inventory = await db_client.get_inventory()
    inv_map = {item.get("id"): item for item in inventory if item.get("id")}
    
    try:
        items_booked = json.loads(target_event.get("items_booked", "{}"))
    except Exception:
        items_booked = {}
        
    resolved_items = []
    try:
        s_date = datetime.strptime(target_event.get("start_date", ""), "%Y-%m-%d").date()
        e_date = datetime.strptime(target_event.get("end_date", ""), "%Y-%m-%d").date()
        days = max(1, (e_date - s_date).days + 1)
    except Exception:
        days = 1
        
    for item_id, qty in items_booked.items():
        if item_id in inv_map:
            item_info = inv_map[item_id]
            rate = item_info.get("rental_price_per_day", 0.0)
            cost = rate * qty * days
            resolved_items.append({
                "item_id": item_id,
                "name": item_info.get("name", "Unknown Item"),
                "category": item_info.get("category", "General"),
                "quantity": qty,
                "rate": rate,
                "cost": cost
            })
            
    # Include notes custom items if any
    notes = target_event.get("notes", "")
    if notes:
        try:
            notes_data = json.loads(notes)
            if isinstance(notes_data, dict) and "custom_items" in notes_data:
                for c_item in notes_data["custom_items"]:
                    qty = int(c_item.get("qty") or 0)
                    rate = float(c_item.get("rate") or 0.0)
                    resolved_items.append({
                        "item_id": "custom",
                        "name": c_item.get("desc", "Custom Item"),
                        "category": "Custom",
                        "quantity": qty,
                        "rate": rate,
                        "cost": qty * rate * days
                    })
        except Exception:
            pass
            
    # Fetch tagged gallery photos for the event
    event_photos = []
    try:
        gallery_items = await db_client.get_gallery()
        event_photos = [
            item.get("image_url")
            for item in gallery_items
            if item.get("event_id") == target_event.get("id")
        ]
    except Exception as g_err:
        print(f"[!] Error fetching gallery items for portal: {g_err}")

    public_event = {
        "id": target_event.get("id"),
        "client_name": target_event.get("client_name"),
        "venue_address": target_event.get("venue_address"),
        "start_date": target_event.get("start_date"),
        "end_date": target_event.get("end_date"),
        "status": target_event.get("status"),
        "design_layout_url": target_event.get("design_layout_url", ""),
        "total_invoice_amount": target_event.get("total_invoice_amount", 0.0),
        "amount_paid": target_event.get("amount_paid", 0.0),
        "remaining_balance": target_event.get("remaining_balance", 0.0),
        "tax_rate": target_event.get("tax_rate", 0.0),
        "discount": target_event.get("discount", 0.0),
        "payment_history": target_event.get("payment_history", "[]"),
        "resolved_items": resolved_items,
        "rental_days": days,
        "progress_stage": int(target_event.get("progress_stage") or 0),
        "event_photos": event_photos
    }
    
    return public_event

class PortalActionSchema(BaseModel):
    action: str
    feedback: Optional[str] = ""

@app.post("/api/portal/{token}/action")
async def handle_portal_action(token: str, payload: PortalActionSchema, request: Request, background_tasks: BackgroundTasks):
    from backend.db_client import db_client
    import datetime
    from backend.alerts import dispatch_telegram_alert
    
    events = await db_client.get_events()
    target_event = None
    for e in events:
        if e.get("portal_token") == token:
            target_event = e
            break
            
    if not target_event:
        raise HTTPException(status_code=404, detail="Booking not found or invalid link.")
        
    client_name = target_event.get("client_name") or "Valued Client"
    venue = target_event.get("venue_address") or "N/A"
    event_id = target_event.get("id")
    
    if payload.action == "approve":
        if target_event.get("status") == "Confirmed":
            return {"status": "success", "message": "Booking is already confirmed."}
            
        await db_client.update_event(event_id, {"status": "Confirmed", "progress_stage": 1})
        
        try:
            from backend.mail_helper import get_event_email_context, send_system_email
            updated_event = await db_client.get_event(event_id)
            client_email, email_context = await get_event_email_context(updated_event, request)
            if client_email:
                background_tasks.add_task(send_system_email, client_email, "confirmation", email_context)
        except Exception as mail_err:
            print(f"[!] Error scheduling confirmation email from portal approval: {mail_err}")
            
        alert_text = f"<b>✓ Portal Booking Approved by Client!</b>\nClient: {client_name}\nVenue: {venue}\nEvent ID: {event_id}"
        background_tasks.add_task(dispatch_telegram_alert, alert_text)
        
        return {"status": "success", "message": "Booking successfully confirmed!"}
        
    elif payload.action == "reject":
        feedback_text = payload.feedback.strip() if payload.feedback else ""
        if not feedback_text:
            raise HTTPException(status_code=400, detail="Feedback is required when requesting changes.")
            
        old_notes = target_event.get("notes") or ""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        new_feedback_entry = f"\n[{timestamp} Client Feedback]: {feedback_text}\n"
        
        updated_notes = old_notes + new_feedback_entry
        await db_client.update_event(event_id, {"notes": updated_notes})
        
        alert_text = f"<b>⚠️ Portal Change Requested by Client!</b>\nClient: {client_name}\nVenue: {venue}\nFeedback: {feedback_text}"
        background_tasks.add_task(dispatch_telegram_alert, alert_text)
        
        return {"status": "success", "message": "Change request submitted successfully."}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'.")

@app.get("/api/availability")
async def get_availability():
    from datetime import datetime, timedelta
    from backend.db_client import db_client
    
    events = await db_client.get_events()
    booked_dates = set()
    
    for event in events:
        status = event.get("status")
        if status in ("Confirmed", "Completed"):
            start_str = event.get("start_date", "")
            end_str = event.get("end_date", "")
            if start_str and end_str:
                try:
                    start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
                    end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
                    curr = start_date
                    while curr <= end_date:
                        booked_dates.add(curr.strftime("%Y-%m-%d"))
                        curr += timedelta(days=1)
                except Exception as e:
                    print(f"[!] Error parsing event dates: {e}")

    # Also include admin manual overrides
    try:
        overrides = await db_client.get_availability_overrides()
        for ov in overrides:
            if ov.get("blocked", True):
                booked_dates.add(ov.get("date", ""))
            else:
                booked_dates.discard(ov.get("date", ""))
    except Exception as e:
        print(f"[!] Error loading availability overrides: {e}")
                    
    return {"booked_dates": sorted(list(booked_dates))}


# ─── Admin Analytics Endpoint ─────────────────────────────────────────────────
@app.get("/api/admin/analytics")
async def get_admin_analytics(request: Request):
    from backend.auth import require_admin
    from backend.db_client import db_client
    from datetime import datetime
    import json
    await require_admin(request)

    events = await db_client.get_events()
    inventory_items = await db_client.get_inventory()
    inv_map = {item.get("id"): item for item in inventory_items if item.get("id")}

    # Monthly revenue (last 6 months)
    now = datetime.now()
    monthly_revenue = {}
    for i in range(5, -1, -1):
        from datetime import date as dt_date
        import calendar
        m = (now.month - i - 1) % 12 + 1
        y = now.year if (now.month - i) > 0 else now.year - 1
        label = datetime(y, m, 1).strftime("%b %Y")
        monthly_revenue[label] = 0.0

    # Status counts
    status_counts = {"Draft": 0, "Quote": 0, "Confirmed": 0, "Completed": 0}

    # Item usage counts
    item_usage = {}

    # Client revenue
    client_revenue = {}

    total_revenue = 0.0
    completed_count = 0

    for event in events:
        status = event.get("status", "Draft")
        if status in status_counts:
            status_counts[status] += 1

        invoice = float(event.get("total_invoice_amount") or 0)
        total_revenue += invoice
        if status == "Completed":
            completed_count += 1

        # Monthly revenue from start_date
        start_str = event.get("start_date", "")
        if start_str and invoice > 0:
            try:
                ev_date = datetime.strptime(start_str, "%Y-%m-%d")
                label = ev_date.strftime("%b %Y")
                if label in monthly_revenue:
                    monthly_revenue[label] += invoice
            except Exception:
                pass

        # Client revenue
        cname = event.get("client_name", "Unknown")
        client_revenue[cname] = client_revenue.get(cname, 0.0) + invoice

        # Item usage
        try:
            items_booked = json.loads(event.get("items_booked", "{}"))
            for item_id, qty in items_booked.items():
                item_name = inv_map.get(item_id, {}).get("name", item_id)
                item_usage[item_name] = item_usage.get(item_name, 0) + int(qty)
        except Exception:
            pass

    # Top 5 clients by revenue
    top_clients = sorted(client_revenue.items(), key=lambda x: x[1], reverse=True)[:5]
    # Top 5 items by usage
    top_items = sorted(item_usage.items(), key=lambda x: x[1], reverse=True)[:5]

    avg_per_event = round(total_revenue / len(events), 2) if events else 0.0

    return {
        "total_revenue": round(total_revenue, 2),
        "total_events": len(events),
        "completed_events": completed_count,
        "avg_per_event": avg_per_event,
        "monthly_revenue": monthly_revenue,
        "status_counts": status_counts,
        "top_clients": [{ "name": n, "revenue": round(r, 2) } for n, r in top_clients],
        "top_items": [{ "name": n, "usage": u } for n, u in top_items],
    }


# ─── Admin Availability Overrides ─────────────────────────────────────────────
@app.get("/api/admin/availability-overrides")
async def list_availability_overrides(request: Request):
    from backend.auth import require_admin
    from backend.db_client import db_client
    await require_admin(request)
    return await db_client.get_availability_overrides()


class AvailabilityOverrideSchema(BaseModel):
    date: str
    reason: str = ""
    blocked: bool = True


@app.post("/api/admin/availability-overrides")
async def create_availability_override(payload: AvailabilityOverrideSchema, request: Request):
    from backend.auth import require_admin
    from backend.db_client import db_client
    await require_admin(request)
    data = payload.model_dump()
    result = await db_client.create_availability_override(data)
    return {"status": "success", "override": result}


@app.delete("/api/admin/availability-overrides/{override_id}")
async def delete_availability_override(override_id: str, request: Request):
    from backend.auth import require_admin
    from backend.db_client import db_client
    await require_admin(request)
    await db_client.delete_availability_override(override_id)
    return {"status": "success"}


# ─── Admin: Update Event Progress Stage ───────────────────────────────────────
class ProgressStageSchema(BaseModel):
    progress_stage: int  # 0=Pending, 1=Design Approved, 2=Materials Sourced, 3=Setup Day, 4=Completed

@app.put("/api/admin/events/{event_id}/progress")
async def update_event_progress(event_id: str, payload: ProgressStageSchema, request: Request):
    from backend.auth import require_admin
    from backend.db_client import db_client
    await require_admin(request)
    event = await db_client.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    event["progress_stage"] = payload.progress_stage
    updated = await db_client.update_event(event_id, event)
    return {"status": "success", "event": updated}

class SettingsSchema(BaseModel):
    company_name: Optional[str] = "Bhoomi Decoration"
    company_address: Optional[str] = "Mumbai, Maharashtra, India"
    company_email: Optional[str] = "hello@bhoomidecoration.com"
    company_phone: Optional[str] = "+91 99999 99999"
    company_website: Optional[str] = "www.bhoomidecoration.com"
    default_tax_rate: Optional[float] = 18.0
    default_discount: Optional[float] = 0.0
    smtp_host: Optional[str] = "smtp.gmail.com"
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = ""
    smtp_pass: Optional[str] = ""
    email_subject: Optional[str] = "Bhoomi Decoration Event Portal & Invoice — {client_name}"
    email_body: Optional[str] = ""
    confirm_email_subject: Optional[str] = "Event Booking Confirmed — Bhoomi Decoration"
    confirm_email_body: Optional[str] = ""
    completed_email_subject: Optional[str] = "Thank You from Bhoomi Decoration!"
    completed_email_body: Optional[str] = ""
    theme: Optional[str] = "crimson_red"
    enable_auto_emails: Optional[bool] = True

@app.get("/api/admin/settings")
async def get_system_settings(request: Request):
    from backend.auth import require_admin
    await require_admin(request)
    from backend.db_client import db_client
    return await db_client.get_settings()

@app.put("/api/admin/settings")
async def update_system_settings(request: Request, payload: SettingsSchema):
    from backend.auth import require_admin
    await require_admin(request)
    from backend.db_client import db_client
    return await db_client.update_settings(payload.dict())

class EmailRequestSchema(BaseModel):
    to_email: str
    subject: str
    body: str

@app.post("/api/send-email")
async def send_email_api(payload: EmailRequestSchema, request: Request):
    from backend.auth import require_admin
    await require_admin(request)
    
    import os
    if os.getenv("TESTING") == "true" or os.getenv("DISABLE_EMAIL") == "true":
        print(f"[TESTING] Mock SMTP: Simulated sending custom email to {payload.to_email}.")
        return {"status": "success", "message": f"[TESTING] Simulated email successfully sent to {payload.to_email}!"}
        
    from backend.db_client import db_client
    settings = await db_client.get_settings()
    
    from backend.mail_helper import send_email_base
    try:
        send_email_base(payload.to_email, payload.subject, payload.body, settings)
        return {"status": "success", "message": f"Email successfully sent to {payload.to_email}!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

