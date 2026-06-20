from fastapi import APIRouter, Request, BackgroundTasks
from backend import config
import httpx

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

async def dispatch_telegram_alert(summary: str):
    if not config.TELEGRAM_BOT_TOKEN or not config.TELEGRAM_CHAT_ID:
        return False
    
    url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": config.TELEGRAM_CHAT_ID,
        "text": f"🔔 Bhoomi Decoration Alert:\n\n{summary}",
        "parse_mode": "HTML"
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(url, json=payload)
            return res.status_code == 200
    except Exception as e:
        print(f"[!] Failed to send Telegram alert: {e}")
        return False

@router.post("/webhook")
async def appwrite_webhook_receiver(request: Request, background_tasks: BackgroundTasks):
    try:
        payload = await request.json()
        event_name = payload.get("events", ["database.documents.update"])[0]
        data = payload.get("data", payload)
        
        client_name = data.get("client_name", "Unknown Client")
        venue = data.get("venue_address", "Unknown Venue")
        start = data.get("start_date", "")
        end = data.get("end_date", "")
        invoice_total = data.get("total_invoice_amount", data.get("total_invoice", 0.0))
        status = data.get("status", "Unknown")
        
        summary = f"<b>Appwrite Webhook Event: {event_name}</b>\n" \
                  f"Client: {client_name}\n" \
                  f"Venue: {venue}\n" \
                  f"Dates: {start} to {end}\n" \
                  f"Invoice Total: ${invoice_total}\n" \
                  f"Status: {status}"
                  
        background_tasks.add_task(dispatch_telegram_alert, summary)
        return {"status": "dispatched", "message": "Alert processing scheduled."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
