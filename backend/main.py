import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from backend import auth, inventory, finance, alerts, gallery, crew, callbacks

app = FastAPI(
    title="Event Decoration & Logistics Management API",
    version="1.5",
    description="Backend services for tracking warehouse stocks, event crew scheduling, and client invoices.",
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

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
        "rental_days": days
    }
    
    return public_event

